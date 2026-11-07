import type { QueryResultRow } from 'pg';
import { consultar } from '@/lib/db/conexion';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { validarTrabajador, type EstadoTrabajador } from '@/lib/reglas/trabajador';
import type { DatosTrabajador } from '@/lib/validacion/esquemas';
import type { OpcionalesConUndefined, Trabajador } from './tipos';

type TrabajadorFila = QueryResultRow & Trabajador;

function esUnicoDuplicado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

export async function listarTrabajadores(filtros: OpcionalesConUndefined<{
  estado?: EstadoTrabajador;
  incluirInactivos?: boolean;
}> = {}): Promise<Trabajador[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  if (filtros.estado) {
    valores.push(filtros.estado);
    condiciones.push(`estado = $${valores.length}`);
  } else if (!filtros.incluirInactivos) {
    condiciones.push("estado = 'activo'");
  }

  valores.push(500);
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  return consultar<TrabajadorFila>(
    `SELECT id, nombre, documento, cargo, telefono, estado
       FROM trabajadores ${where}
      ORDER BY nombre
      LIMIT $${valores.length}`,
    valores,
  );
}

export async function crearTrabajador(datos: DatosTrabajador): Promise<{ id: string }> {
  validarTrabajador(datos);
  try {
    const filas = await consultar<{ id: string } & QueryResultRow>(
      `INSERT INTO trabajadores (nombre, documento, cargo, telefono, estado)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        datos.nombre.trim(),
        datos.documento.trim(),
        datos.cargo.trim(),
        datos.telefono?.trim() || null,
        datos.estado ?? 'activo',
      ],
    );
    const fila = filas[0];
    if (!fila) throw new Error('Postgres no devolvió el trabajador creado.');
    return { id: fila.id };
  } catch (error) {
    if (esUnicoDuplicado(error)) throw new ErrorDeNegocio('DOCUMENTO_DUPLICADO');
    throw error;
  }
}

export async function actualizarTrabajador(
  id: string,
  cambios: OpcionalesConUndefined<DatosTrabajador> & {
    estado?: EstadoTrabajador | undefined;
  },
): Promise<void> {
  if (cambios.nombre !== undefined || cambios.documento !== undefined || cambios.cargo !== undefined) {
    validarTrabajador({
      nombre: cambios.nombre ?? 'válido',
      documento: cambios.documento ?? 'válido',
      cargo: cambios.cargo ?? 'válido',
    });
  }
  const asignaciones: string[] = [];
  const valores: unknown[] = [];
  const campos = [
    ['nombre', cambios.nombre?.trim()],
    ['documento', cambios.documento?.trim()],
    ['cargo', cambios.cargo?.trim()],
    ['telefono', cambios.telefono?.trim() || null],
    ['estado', cambios.estado],
  ] as const;
  for (const [campo, valor] of campos) {
    if (valor === undefined) continue;
    valores.push(valor);
    asignaciones.push(`${campo} = $${valores.length}`);
  }
  if (!asignaciones.length) return;

  valores.push(id);
  try {
    const filas = await consultar<{ id: string } & QueryResultRow>(
      `UPDATE trabajadores SET ${asignaciones.join(', ')}
        WHERE id = $${valores.length}
        RETURNING id`,
      valores,
    );
    if (!filas[0]) throw new ErrorDeNegocio('TRABAJADOR_NO_ENCONTRADO');
  } catch (error) {
    if (esUnicoDuplicado(error)) throw new ErrorDeNegocio('DOCUMENTO_DUPLICADO');
    throw error;
  }
}
