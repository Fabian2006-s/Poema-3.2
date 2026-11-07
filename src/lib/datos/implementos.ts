import type { QueryResultRow } from 'pg';
import { consultar } from '@/lib/db/conexion';
import { CANTIDAD_MAXIMA, LIMITE_LISTADO } from '@/lib/config/finca';
import { hayInventarioBajo, estadoElemento } from '@/lib/reglas/alertas';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { hoyBogota } from '@/lib/reglas/fechas';
import { esquemaImplemento } from '@/lib/validacion/esquemas';
import type { Implemento, OpcionalesConUndefined } from './tipos';

type ImplementoFila = QueryResultRow & {
  id: string;
  nombre: string;
  categoria: string;
  disponible: number;
  minima: number;
  inactivo: boolean;
};

function mapearImplemento(fila: ImplementoFila, hoy: string): Implemento {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    disponible: fila.disponible,
    minima: fila.minima,
    estado: estadoElemento({
      tipo: 'implemento',
      disponible: fila.disponible,
      inactivo: fila.inactivo,
      hoy,
    }),
    inventarioBajo: hayInventarioBajo(fila.disponible, fila.minima),
    inactivo: fila.inactivo,
  };
}

export async function listarImplementos(filtros: OpcionalesConUndefined<{
  soloBajos?: boolean;
  incluirInactivos?: boolean;
}> = {}): Promise<Implemento[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  if (!filtros.incluirInactivos) condiciones.push('inactivo = false');
  if (filtros.soloBajos) condiciones.push('inventario_bajo = true');
  valores.push(LIMITE_LISTADO);
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const filas = await consultar<ImplementoFila>(
    `SELECT id, nombre, categoria, disponible, minima, inactivo
       FROM v_implementos ${where}
      ORDER BY nombre
      LIMIT $${valores.length}`,
    valores,
  );
  const hoy = hoyBogota();
  return filas.map((fila) => mapearImplemento(fila, hoy));
}

export async function crearImplemento(
  datos: { nombre: string; categoria: string; disponible: number; minima: number },
): Promise<{ id: string }> {
  const validos = esquemaImplemento.parse(datos);
  if (validos.disponible > CANTIDAD_MAXIMA || validos.minima > CANTIDAD_MAXIMA) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  try {
    const filas = await consultar<{ id: string } & QueryResultRow>(
      `INSERT INTO implementos (nombre, categoria, disponible, minima)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [validos.nombre, validos.categoria, validos.disponible, validos.minima],
    );
    const fila = filas[0];
    if (!fila) throw new Error('Postgres no devolvió el implemento creado.');
    return { id: fila.id };
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorDeNegocio('IMPLEMENTO_DUPLICADO');
    throw error;
  }
}

export async function actualizarImplemento(
  id: string,
  cambios: OpcionalesConUndefined<{
    nombre: string;
    categoria: string;
    disponible: number;
    minima: number;
    inactivo: boolean;
  }>,
): Promise<void> {
  if (cambios.disponible !== undefined && cambios.disponible > CANTIDAD_MAXIMA) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (cambios.minima !== undefined && cambios.minima > CANTIDAD_MAXIMA) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  const campos = [
    ['nombre', cambios.nombre?.trim()],
    ['categoria', cambios.categoria?.trim()],
    ['disponible', cambios.disponible],
    ['minima', cambios.minima],
    ['inactivo', cambios.inactivo],
  ] as const;
  await actualizarFila('implementos', id, campos);
}

async function actualizarFila(
  tabla: 'implementos',
  id: string,
  campos: readonly (readonly [string, string | number | boolean | undefined])[],
): Promise<void> {
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
      `UPDATE ${tabla} SET ${asignaciones.join(', ')}
        WHERE id = $${valores.length}
        RETURNING id`,
      valores,
    );
    if (!filas[0]) throw new ErrorDeNegocio('IMPLEMENTO_NO_ENCONTRADO');
  } catch (error) {
    if (esDuplicado(error)) throw new ErrorDeNegocio('IMPLEMENTO_DUPLICADO');
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
