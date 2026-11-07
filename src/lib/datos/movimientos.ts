import type { PoolClient, QueryResultRow } from 'pg';
import { aCentesimas, deCentesimas } from '@/lib/reglas/cantidades';
import { CENTESIMAS, DIAS_AVISO_VENCIMIENTO } from '@/lib/config/finca';
import { hayInventarioBajo, nivelVencimiento, estadoElemento } from '@/lib/reglas/alertas';
import { conTransaccion, consultar } from '@/lib/db/conexion';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { estaVencido, hoyBogota } from '@/lib/reglas/fechas';
import {
  nuevaCantidad,
  validarCantidadMovimiento,
  validarMotivoYFecha,
  type TipoElemento,
} from '@/lib/reglas/inventario';
import type {
  DatosMovimiento,
  Implemento,
  Movimiento,
  OpcionalesConUndefined,
  Quimico,
  ResultadoMovimiento,
} from './tipos';

type ElementoFila = QueryResultRow & {
  id: string;
  nombre: string;
  categoria: string;
  disponible: number;
  minima: number;
  inactivo: boolean;
  disponible_cent?: number;
  minima_cent?: number;
  unidad?: string;
  fecha_vencimiento?: string;
};

type MovimientoFila = QueryResultRow & {
  id: number;
  tipo_elemento: TipoElemento;
  elemento_id: string;
  tipo: 'entrada' | 'salida';
  cantidad_cent: number;
  motivo: string;
  fecha: string;
  elemento_nombre: string;
};

export async function registrarMovimiento(datos: DatosMovimiento): Promise<ResultadoMovimiento> {
  validarCantidadMovimiento(datos.cantidad, datos.tipoElemento);
  validarMotivoYFecha(datos.motivo, datos.fecha);
  const hoy = hoyBogota();

  return conTransaccion(async (tx) => {
    const elemento = await bloquearElemento(tx, datos.tipoElemento, datos.elementoId);
    if (!elemento || elemento.inactivo) throw new ErrorDeNegocio('ELEMENTO_NO_ENCONTRADO');

    if (
      datos.tipoMovimiento === 'salida' &&
      datos.tipoElemento === 'quimico' &&
      elemento.fecha_vencimiento &&
      estaVencido(elemento.fecha_vencimiento, hoy)
    ) {
      throw new ErrorDeNegocio('QUIMICO_VENCIDO');
    }

    const cantidadCent =
      datos.tipoElemento === 'implemento'
        ? datos.cantidad * CENTESIMAS
        : aCentesimas(datos.cantidad);
    const nuevaDisponible =
      datos.tipoElemento === 'implemento'
        ? nuevaCantidad(elemento.disponible, datos.tipoMovimiento, datos.cantidad)
        : nuevaCantidad(
            elemento.disponible_cent ?? 0,
            datos.tipoMovimiento,
            aCentesimas(datos.cantidad),
          );

    let filaActualizada: ElementoFila;
    if (datos.tipoElemento === 'implemento') {
      const { rows } = await tx.query<ElementoFila>(
        `UPDATE implementos SET disponible = $1 WHERE id = $2
         RETURNING id, nombre, categoria, disponible, minima, inactivo`,
        [nuevaDisponible, datos.elementoId],
      );
      const fila = rows[0];
      if (!fila) throw new ErrorDeNegocio('ELEMENTO_NO_ENCONTRADO');
      filaActualizada = fila;
    } else {
      const { rows } = await tx.query<ElementoFila>(
        `UPDATE quimicos SET disponible_cent = $1 WHERE id = $2
         RETURNING id, nombre, categoria, disponible_cent, minima_cent, unidad,
                   fecha_vencimiento, inactivo`,
        [nuevaDisponible, datos.elementoId],
      );
      const fila = rows[0];
      if (!fila) throw new ErrorDeNegocio('ELEMENTO_NO_ENCONTRADO');
      filaActualizada = fila;
    }

    const insertado = await tx.query<MovimientoFila>(
      `INSERT INTO movimientos
         (tipo_elemento, elemento_id, tipo, cantidad_cent, motivo, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, tipo_elemento, elemento_id, tipo, cantidad_cent, motivo, fecha`,
      [
        datos.tipoElemento,
        datos.elementoId,
        datos.tipoMovimiento,
        cantidadCent,
        datos.motivo.trim(),
        datos.fecha,
      ],
    );
    const filaMovimiento = insertado.rows[0];
    if (!filaMovimiento) throw new Error('Postgres no devolvió el movimiento registrado.');

    const elementoResultado =
      datos.tipoElemento === 'implemento'
        ? mapearImplemento(filaActualizada, hoy)
        : mapearQuimico(filaActualizada, hoy);
    return {
      tipoElemento: datos.tipoElemento,
      elemento: elementoResultado,
      movimiento: mapearMovimiento(filaMovimiento, datos.cantidad, filaActualizada.nombre),
    };
  });
}

export async function listarMovimientos(filtros: OpcionalesConUndefined<{
  tipoElemento?: TipoElemento;
  elementoId?: string;
  desde?: string;
  hasta?: string;
}> = {}): Promise<Movimiento[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];
  const filtrosSql = [
    ['m.tipo_elemento =', filtros.tipoElemento],
    ['m.elemento_id =', filtros.elementoId],
    ['m.fecha >=', filtros.desde],
    ['m.fecha <=', filtros.hasta],
  ] as const;
  for (const [campo, valor] of filtrosSql) {
    if (valor === undefined) continue;
    valores.push(valor);
    condiciones.push(`${campo} $${valores.length}`);
  }
  valores.push(500);
  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const filas = await consultar<MovimientoFila>(
    `SELECT m.id, m.tipo_elemento, m.elemento_id, m.tipo, m.cantidad_cent,
            m.motivo, m.fecha,
            CASE WHEN m.tipo_elemento = 'implemento' THEN i.nombre ELSE q.nombre END AS elemento_nombre
       FROM movimientos m
       LEFT JOIN implementos i ON m.tipo_elemento = 'implemento' AND i.id = m.elemento_id
       LEFT JOIN quimicos q ON m.tipo_elemento = 'quimico' AND q.id = m.elemento_id
       ${where}
      ORDER BY m.fecha DESC, m.id DESC
      LIMIT $${valores.length}`,
    valores,
  );
  return filas.map((fila) =>
    mapearMovimiento(
      fila,
      fila.tipo_elemento === 'implemento'
        ? fila.cantidad_cent / CENTESIMAS
        : deCentesimas(fila.cantidad_cent),
      fila.elemento_nombre,
    ),
  );
}

async function bloquearElemento(
  tx: PoolClient,
  tipo: TipoElemento,
  id: string,
): Promise<ElementoFila | undefined> {
  if (tipo === 'implemento') {
    const { rows } = await tx.query<ElementoFila>(
      `SELECT id, nombre, categoria, disponible, minima, inactivo
         FROM implementos WHERE id = $1 FOR UPDATE`,
      [id],
    );
    return rows[0];
  }
  const { rows } = await tx.query<ElementoFila>(
    `SELECT id, nombre, categoria, disponible_cent, minima_cent, unidad,
            fecha_vencimiento, inactivo
       FROM quimicos WHERE id = $1 FOR UPDATE`,
    [id],
  );
  return rows[0];
}

function mapearImplemento(fila: ElementoFila, hoy: string): Implemento {
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

function mapearQuimico(fila: ElementoFila, hoy: string): Quimico {
  const disponibleCent = fila.disponible_cent ?? 0;
  const minimaCent = fila.minima_cent ?? 0;
  const disponible = deCentesimas(disponibleCent);
  const fechaVencimiento = fila.fecha_vencimiento ?? '';
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    disponible,
    minima: deCentesimas(minimaCent),
    unidad: fila.unidad ?? '',
    fechaVencimiento,
    estado: estadoElemento({
      tipo: 'quimico',
      disponible,
      inactivo: fila.inactivo,
      fechaVencimiento,
      hoy,
    }),
    inventarioBajo: hayInventarioBajo(disponible, deCentesimas(minimaCent)),
    nivelVencimiento: nivelVencimiento(fechaVencimiento, hoy, DIAS_AVISO_VENCIMIENTO),
    inactivo: fila.inactivo,
  };
}

function mapearMovimiento(
  fila: MovimientoFila,
  cantidad: number,
  elementoNombre: string,
): Movimiento {
  return {
    id: fila.id,
    tipoElemento: fila.tipo_elemento,
    elementoId: fila.elemento_id,
    tipoMovimiento: fila.tipo,
    cantidad,
    motivo: fila.motivo,
    fecha: fila.fecha,
    elementoNombre,
  };
}
