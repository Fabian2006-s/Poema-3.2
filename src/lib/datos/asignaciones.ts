import type { PoolClient, QueryResultRow } from 'pg';
import { CANTIDAD_MAXIMA } from '@/lib/config/finca';
import { conTransaccion, consultar } from '@/lib/db/conexion';
import { puedeRecibirAsignacion } from '@/lib/reglas/trabajador';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { hoyBogota } from '@/lib/reglas/fechas';
import { nuevaCantidad } from '@/lib/reglas/inventario';
import type { Asignacion, AsignacionDetalle, ImplementoAsignado } from './tipos';

type AsignacionFila = QueryResultRow & {
  id: string;
  trabajador_id: string;
  implemento_id: string;
  cantidad: number;
  fecha: string;
  estado: 'entregado' | 'devuelto';
};

type AsignacionDetalleFila = AsignacionFila & {
  trabajador_nombre: string;
  implemento_nombre: string;
  categoria: string;
};

export async function asignarImplemento(datos: {
  trabajadorId: string;
  implementoId: string;
  cantidad: number;
}): Promise<Asignacion> {
  if (
    !Number.isInteger(datos.cantidad) ||
    datos.cantidad < 1 ||
    datos.cantidad > CANTIDAD_MAXIMA
  ) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }

  return conTransaccion(async (tx) => {
    const trabajador = await bloquearTrabajador(tx, datos.trabajadorId);
    if (!trabajador) throw new ErrorDeNegocio('TRABAJADOR_NO_ENCONTRADO');
    if (!puedeRecibirAsignacion(trabajador.estado)) {
      throw new ErrorDeNegocio('TRABAJADOR_INACTIVO');
    }

    const implemento = await bloquearImplemento(tx, datos.implementoId);
    if (!implemento || implemento.inactivo) {
      throw new ErrorDeNegocio('IMPLEMENTO_NO_ENCONTRADO');
    }
    const disponible = nuevaCantidad(implemento.disponible, 'salida', datos.cantidad);
    await tx.query('UPDATE implementos SET disponible = $1 WHERE id = $2', [
      disponible,
      datos.implementoId,
    ]);

    const resultado = await tx.query<AsignacionFila>(
      `INSERT INTO asignaciones
         (trabajador_id, implemento_id, cantidad, fecha, estado)
       VALUES ($1, $2, $3, $4, 'entregado')
       RETURNING id, trabajador_id, implemento_id, cantidad, fecha, estado`,
      [datos.trabajadorId, datos.implementoId, datos.cantidad, hoyBogota()],
    );
    const fila = resultado.rows[0];
    if (!fila) throw new Error('Postgres no devolvió la asignación creada.');
    return mapearAsignacion(fila);
  });
}

export async function registrarDevolucion(asignacionId: string): Promise<Asignacion> {
  return conTransaccion(async (tx) => {
    const consulta = await tx.query<AsignacionFila>(
      `SELECT id, trabajador_id, implemento_id, cantidad, fecha, estado
         FROM asignaciones WHERE id = $1 FOR UPDATE`,
      [asignacionId],
    );
    const asignacion = consulta.rows[0];
    if (!asignacion) throw new ErrorDeNegocio('ASIGNACION_NO_ENCONTRADA');
    if (asignacion.estado !== 'entregado') {
      throw new ErrorDeNegocio('ASIGNACION_NO_DEVOLUCION');
    }

    const implemento = await bloquearImplemento(tx, asignacion.implemento_id);
    if (!implemento) throw new ErrorDeNegocio('IMPLEMENTO_NO_ENCONTRADO');
    if (implemento.disponible + asignacion.cantidad > CANTIDAD_MAXIMA) {
      throw new ErrorDeNegocio('DATOS_INVALIDOS');
    }
    await tx.query('UPDATE implementos SET disponible = $1 WHERE id = $2', [
      implemento.disponible + asignacion.cantidad,
      asignacion.implemento_id,
    ]);

    const actualizada = await tx.query<AsignacionFila>(
      `UPDATE asignaciones SET estado = 'devuelto'
        WHERE id = $1 AND estado = 'entregado'
        RETURNING id, trabajador_id, implemento_id, cantidad, fecha, estado`,
      [asignacionId],
    );
    const fila = actualizada.rows[0];
    if (!fila) throw new ErrorDeNegocio('ASIGNACION_NO_DEVOLUCION');
    return mapearAsignacion(fila);
  });
}

export async function listarAsignaciones(): Promise<AsignacionDetalle[]> {
  const filas = await consultar<AsignacionDetalleFila>(
    `SELECT a.id, a.trabajador_id, a.implemento_id, a.cantidad, a.fecha, a.estado,
            t.nombre AS trabajador_nombre, i.nombre AS implemento_nombre, i.categoria
       FROM asignaciones a
       JOIN trabajadores t ON t.id = a.trabajador_id
       JOIN implementos i ON i.id = a.implemento_id
      ORDER BY (a.estado = 'entregado') DESC, a.fecha DESC, a.id DESC
      LIMIT 500`,
  );
  return filas.map((fila) => ({
    ...mapearAsignacion(fila),
    trabajadorNombre: fila.trabajador_nombre,
    implementoNombre: fila.implemento_nombre,
    categoria: fila.categoria,
  }));
}

export async function implementosDeTrabajador(
  trabajadorId: string,
): Promise<ImplementoAsignado[]> {
  const trabajadores = await consultar<QueryResultRow & { id: string }>(
    'SELECT id FROM trabajadores WHERE id = $1',
    [trabajadorId],
  );
  if (!trabajadores[0]) throw new ErrorDeNegocio('TRABAJADOR_NO_ENCONTRADO');

  const filas = await consultar<
    QueryResultRow & {
      asignacion_id: string;
      implemento_id: string;
      nombre: string;
      categoria: string;
      cantidad: number;
      fecha: string;
    }
  >(
    `SELECT a.id AS asignacion_id, i.id AS implemento_id, i.nombre, i.categoria,
            a.cantidad, a.fecha
       FROM asignaciones a
       JOIN implementos i ON i.id = a.implemento_id
      WHERE a.trabajador_id = $1 AND a.estado = 'entregado'
      ORDER BY i.nombre, a.fecha`,
    [trabajadorId],
  );
  return filas.map((fila) => ({
    asignacionId: fila.asignacion_id,
    implementoId: fila.implemento_id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    cantidad: fila.cantidad,
    fecha: fila.fecha,
  }));
}

async function bloquearTrabajador(
  tx: PoolClient,
  trabajadorId: string,
): Promise<{ estado: 'activo' | 'inactivo' } | undefined> {
  const resultado = await tx.query<
    QueryResultRow & { estado: 'activo' | 'inactivo' }
  >('SELECT estado FROM trabajadores WHERE id = $1 FOR UPDATE', [trabajadorId]);
  return resultado.rows[0];
}

async function bloquearImplemento(
  tx: PoolClient,
  implementoId: string,
): Promise<{ disponible: number; inactivo: boolean } | undefined> {
  const resultado = await tx.query<
    QueryResultRow & { disponible: number; inactivo: boolean }
  >('SELECT disponible, inactivo FROM implementos WHERE id = $1 FOR UPDATE', [
    implementoId,
  ]);
  return resultado.rows[0];
}

function mapearAsignacion(fila: AsignacionFila): Asignacion {
  return {
    id: fila.id,
    trabajadorId: fila.trabajador_id,
    implementoId: fila.implemento_id,
    cantidad: fila.cantidad,
    fecha: fila.fecha,
    estado: fila.estado,
  };
}
