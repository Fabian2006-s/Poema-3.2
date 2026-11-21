import { z } from 'zod';
import { minutosAsistenciaValidos } from '@/lib/reglas/asistencia';
import { esFechaValida } from '@/lib/reglas/fechas';
import { proximaLecturaValida } from '@/lib/reglas/maquinaria';

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

const dosDecimales = (valor: number) => Number(valor.toFixed(2)) === valor;
const observacionOpcional = z.string().trim().max(300).optional();

export const esquemaOperacion = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('crear_parcela'),
    nombre: nombre(120),
    areaHa: z.number().finite().positive().max(100000).refine(dosDecimales).optional(),
  }),
  z.object({
    tipo: z.literal('registrar_produccion'),
    parcelaId: z.uuid(),
    fecha,
    racimos: z.number().int().min(1).max(1000000),
    cajas: z.number().int().min(0).max(1000000),
    observacion: observacionOpcional,
  }),
  z.object({
    tipo: z.literal('registrar_riego'),
    parcelaId: z.uuid(),
    fecha,
    metodo: nombre(80),
    duracionMinutos: z.number().int().min(1).max(1440),
    volumenM3: z.number().finite().positive().max(100000).refine(dosDecimales),
    observacion: observacionOpcional,
  }),
  z.object({
    tipo: z.literal('registrar_asistencia'),
    trabajadorId: z.uuid(),
    fecha,
    estado: z.enum(['asistio', 'falta', 'permiso', 'incapacidad']),
    minutosTrabajados: z.number().int().min(0).max(1440),
    observacion: observacionOpcional,
  }).refine(
    (datos) => minutosAsistenciaValidos(datos.estado, datos.minutosTrabajados),
    {
    path: ['minutosTrabajados'],
      message: 'Los minutos trabajados deben ser válidos y solo aplican cuando asistió.',
    },
  ),
  z.object({
    tipo: z.literal('crear_maquinaria'),
    nombre: nombre(120),
    categoria: nombre(80),
    identificador: z.string().trim().max(80).optional(),
    unidadMedidor: z.enum(['horas', 'km']),
  }),
  z.object({
    tipo: z.literal('registrar_maquinaria'),
    maquinariaId: z.uuid(),
    fecha,
    tipoRegistro: z.enum(['uso', 'mantenimiento']),
    lectura: z.number().finite().min(0).max(21474836.47).refine(dosDecimales).optional(),
    proximaLectura: z.number().finite().min(0).max(21474836.47).refine(dosDecimales).optional(),
    costoCop: z.number().int().min(0).max(2000000000),
    detalle: nombre(300),
  }).refine((datos) => datos.tipoRegistro !== 'uso' || datos.lectura !== undefined, {
    path: ['lectura'],
    message: 'El uso requiere una lectura del medidor.',
  }).refine(
    (datos) => proximaLecturaValida(datos.lectura, datos.proximaLectura),
    { path: ['proximaLectura'], message: 'La próxima lectura debe superar la lectura actual.' },
  ),
  z.object({
    tipo: z.literal('registrar_empaque'),
    parcelaId: z.uuid(),
    fecha,
    cajas: z.number().int().min(1).max(1000000),
    rechazos: z.number().int().min(0).max(1000000),
    observacion: observacionOpcional,
  }),
  z.object({
    tipo: z.literal('registrar_venta'),
    parcelaId: z.uuid(),
    fecha,
    cliente: nombre(120),
    cajas: z.number().int().min(1).max(1000000),
    valorCop: z.number().int().min(1).max(2000000000),
    remision: z.string().trim().max(80).optional(),
    observacion: observacionOpcional,
  }),
  z.object({
    tipo: z.literal('registrar_gasto'),
    fecha,
    categoria: nombre(60),
    descripcion: nombre(200),
    valorCop: z.number().int().min(1).max(2000000000),
    formaPago: z.string().trim().max(40).optional(),
  }),
  z.object({
    tipo: z.literal('crear_material'),
    nombre: nombre(120),
    unidad: nombre(30),
    minima: z.number().int().min(0).max(1000000),
  }),
  z.object({
    tipo: z.literal('registrar_movimiento_material'),
    materialId: z.uuid(),
    tipoMovimiento: z.enum(['entrada', 'salida']),
    cantidad: z.number().int().min(1).max(1000000),
    motivo: nombre(200),
    fecha,
  }),
]);

export const esquemaEstadoRecurso = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('estado_parcela'), id: z.uuid(), activo: z.boolean() }),
  z.object({ tipo: z.literal('estado_maquinaria'), id: z.uuid(), activo: z.boolean() }),
  z.object({ tipo: z.literal('estado_material'), id: z.uuid(), activo: z.boolean() }),
]);

export const esquemaCrearUsuario = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(8).max(128),
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
export type DatosOperacion = z.infer<typeof esquemaOperacion>;
export type DatosEstadoRecurso = z.infer<typeof esquemaEstadoRecurso>;
export type DatosCrearUsuario = z.infer<typeof esquemaCrearUsuario>;
export type FiltrosFinca = z.infer<typeof esquemaFiltros>;
