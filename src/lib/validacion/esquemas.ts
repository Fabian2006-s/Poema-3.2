import { z } from 'zod';
import { esFechaValida } from '@/lib/reglas/fechas';

const fecha = z.string().refine(esFechaValida, 'Ingrese una fecha válida.');
const nombre = (max: number) => z.string().trim().min(1).max(max);
const filtroBooleano = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((valor) => valor === true || valor === 'true');

export const esquemaTrabajador = z.object({
  nombre: nombre(120),
  documento: nombre(40),
  cargo: nombre(80),
  telefono: z.string().trim().max(40).optional(),
  estado: z.enum(['activo', 'inactivo']).optional(),
});

export const esquemaImplemento = z.object({
  nombre: nombre(120),
  categoria: nombre(60),
  disponible: z.number().int().min(0),
  minima: z.number().int().min(0),
});

export const esquemaQuimico = z.object({
  nombre: nombre(120),
  categoria: nombre(60),
  disponible: z.number().finite().min(0),
  unidad: nombre(20),
  fechaVencimiento: fecha,
  minima: z.number().finite().min(0),
});

export const esquemaMovimiento = z
  .object({
    tipoElemento: z.enum(['implemento', 'quimico']),
    elementoId: z.uuid(),
    tipoMovimiento: z.enum(['entrada', 'salida']),
    cantidad: z.number().finite().gt(0),
    motivo: nombre(200),
    fecha,
  })
  .refine(
    (movimiento) =>
      movimiento.tipoElemento !== 'implemento' || Number.isInteger(movimiento.cantidad),
    { path: ['cantidad'], message: 'La cantidad de un implemento debe ser entera.' },
  );

export const esquemaAsignacion = z.object({
  trabajadorId: z.uuid(),
  implementoId: z.uuid(),
  cantidad: z.number().int().min(1),
});

export const esquemaFiltros = z.object({
  estado: z.enum(['activo', 'inactivo']).optional(),
  estadoElemento: z.enum(['disponible', 'agotado', 'vencido', 'inactivo']).optional(),
  incluirInactivos: filtroBooleano.optional(),
  soloBajos: filtroBooleano.optional(),
  soloPorVencer: filtroBooleano.optional(),
  tipoElemento: z.enum(['implemento', 'quimico']).optional(),
  elementoId: z.uuid().optional(),
  categoria: nombre(60).optional(),
  cargo: nombre(80).optional(),
  desde: fecha.optional(),
  hasta: fecha.optional(),
});

export type DatosTrabajador = z.infer<typeof esquemaTrabajador>;
export type DatosImplemento = z.infer<typeof esquemaImplemento>;
export type DatosQuimico = z.infer<typeof esquemaQuimico>;
export type DatosMovimiento = z.infer<typeof esquemaMovimiento>;
export type DatosAsignacion = z.infer<typeof esquemaAsignacion>;
export type FiltrosFinca = z.infer<typeof esquemaFiltros>;
