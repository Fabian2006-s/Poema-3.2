import type { QueryResultRow } from 'pg';
import { consultar } from '@/lib/db/conexion';
import { CANTIDAD_MAXIMA, DIAS_AVISO_VENCIMIENTO, LIMITE_LISTADO } from '@/lib/config/finca';
import { hayInventarioBajo, nivelVencimiento, estadoElemento } from '@/lib/reglas/alertas';
import { aCentesimas, deCentesimas } from '@/lib/reglas/cantidades';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { hoyBogota } from '@/lib/reglas/fechas';
import { esquemaQuimico } from '@/lib/validacion/esquemas';
import type { Quimico } from './tipos';

type QuimicoFila = QueryResultRow & {
  id: string;
  nombre: string;
  categoria: string;
  disponible_cent: number;
  minima_cent: number;
  unidad: string;
  fecha_vencimiento: string;
  inactivo: boolean;
};

function mapearQuimico(fila: QuimicoFila, hoy: string): Quimico {
  const disponible = deCentesimas(fila.disponible_cent);
  const minima = deCentesimas(fila.minima_cent);
  const nivel = nivelVencimiento(fila.fecha_vencimiento, hoy, DIAS_AVISO_VENCIMIENTO);
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    disponible,
    minima,
    unidad: fila.unidad,
    fechaVencimiento: fila.fecha_vencimiento,
    estado: estadoElemento({
      tipo: 'quimico',
      disponible,
      inactivo: fila.inactivo,
      fechaVencimiento: fila.fecha_vencimiento,
      hoy,
    }),
    inventarioBajo: hayInventarioBajo(disponible, minima),
    nivelVencimiento: nivel,
    inactivo: fila.inactivo,
  };
}

export async function listarQuimicos(filtros: {
  soloBajos?: boolean;
  soloPorVencer?: boolean;
  incluirInactivos?: boolean;
} = {}): Promise<Quimico[]> {
  const condiciones: string[] = [];
  if (!filtros.incluirInactivos) condiciones.push('inactivo = false');
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const filas = await consultar<QuimicoFila>(
    `SELECT id, nombre, categoria, disponible_cent, minima_cent, unidad,
            fecha_vencimiento, inactivo
       FROM v_quimicos ${where}
      ORDER BY nombre
      LIMIT $1`,
    [LIMITE_LISTADO],
  );
  const hoy = hoyBogota();
  return filas
    .map((fila) => mapearQuimico(fila, hoy))
    .filter((quimico) => !filtros.soloBajos || quimico.inventarioBajo)
    .filter((quimico) => !filtros.soloPorVencer || quimico.nivelVencimiento === 'proximo');
}

export async function crearQuimico(
  datos: {
    nombre: string;
    categoria: string;
    disponible: number;
    minima: number;
    unidad: string;
    fechaVencimiento: string;
  },
): Promise<{ id: string }> {
  const validos = esquemaQuimico.parse(datos);
  if (validos.disponible > CANTIDAD_MAXIMA || validos.minima > CANTIDAD_MAXIMA) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  try {
    const filas = await consultar<{ id: string } & QueryResultRow>(
      `INSERT INTO quimicos
         (nombre, categoria, disponible_cent, minima_cent, unidad, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        validos.nombre,
        validos.categoria,
        aCentesimas(validos.disponible),
        aCentesimas(validos.minima),
        validos.unidad,
        validos.fechaVencimiento,
      ],
    );
    const fila = filas[0];
    if (!fila) throw new Error('Postgres no devolvió el químico creado.');
    return { id: fila.id };
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorDeNegocio('QUIMICO_DUPLICADO');
    throw error;
  }
}

export async function actualizarQuimico(
  id: string,
  cambios: Partial<{
    nombre: string;
    categoria: string;
    disponible: number;
    minima: number;
    unidad: string;
    fechaVencimiento: string;
  }> & { inactivo?: boolean },
): Promise<void> {
  for (const cantidad of [cambios.disponible, cambios.minima]) {
    if (
      cantidad !== undefined &&
      (!Number.isFinite(cantidad) || cantidad < 0 || cantidad > CANTIDAD_MAXIMA)
    ) {
      throw new ErrorDeNegocio('DATOS_INVALIDOS');
    }
  }
  const campos = [
    ['nombre', cambios.nombre?.trim()],
    ['categoria', cambios.categoria?.trim()],
    ['disponible_cent', cambios.disponible === undefined ? undefined : aCentesimas(cambios.disponible)],
    ['minima_cent', cambios.minima === undefined ? undefined : aCentesimas(cambios.minima)],
    ['unidad', cambios.unidad?.trim()],
    ['fecha_vencimiento', cambios.fechaVencimiento],
    ['inactivo', cambios.inactivo],
  ] as const;
  const asignaciones: string[] = [];
  const valores: unknown[] = [];
  for (const [campo, valor] of campos) {
    if (valor === undefined) continue;
    valores.push(valor);
    asignaciones.push(`${campo} = $${valores.length}`);
  }
  if (!asignaciones.length) return;
  valores.push(id);
  try {
    const filas = await consultar<{ id: string } & QueryResultRow>(
      `UPDATE quimicos SET ${asignaciones.join(', ')}
        WHERE id = $${valores.length}
        RETURNING id`,
      valores,
    );
    if (!filas[0]) throw new ErrorDeNegocio('ELEMENTO_NO_ENCONTRADO');
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorDeNegocio('QUIMICO_DUPLICADO');
    throw error;
  }
}

function esDuplicado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}
