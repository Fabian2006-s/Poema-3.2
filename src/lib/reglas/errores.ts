export type CodigoError =
  | 'DATOS_INVALIDOS'
  | 'NO_AUTORIZADO'
  | 'DOCUMENTO_DUPLICADO'
  | 'CORREO_DUPLICADO'
  | 'IMPLEMENTO_DUPLICADO'
  | 'QUIMICO_DUPLICADO'
  | 'PARCELA_DUPLICADA'
  | 'MAQUINARIA_DUPLICADA'
  | 'MATERIAL_DUPLICADO'
  | 'TRABAJADOR_NO_ENCONTRADO'
  | 'TRABAJADOR_INACTIVO'
  | 'IMPLEMENTO_NO_ENCONTRADO'
  | 'ELEMENTO_NO_ENCONTRADO'
  | 'CANTIDAD_INSUFICIENTE'
  | 'QUIMICO_VENCIDO'
  | 'LECTURA_MAQUINARIA_INVALIDA'
  | 'RECURSO_NO_ENCONTRADO'
  | 'ASIGNACION_NO_ENCONTRADA'
  | 'ASIGNACION_NO_DEVOLUCION'
  | 'TIENE_DEPENDENCIAS'
  | 'ERROR_INTERNO';

export const MENSAJES: Record<CodigoError, string> = {
  DATOS_INVALIDOS: 'Revise los datos ingresados.',
  NO_AUTORIZADO: 'Debe iniciar sesión.',
  DOCUMENTO_DUPLICADO: 'Ya existe un trabajador con ese documento.',
  CORREO_DUPLICADO: 'Ya existe un usuario con ese correo electrónico.',
  IMPLEMENTO_DUPLICADO: 'Ya existe un implemento con ese nombre.',
  QUIMICO_DUPLICADO: 'Ya existe un producto químico con ese nombre.',
  PARCELA_DUPLICADA: 'Ya existe una parcela con ese nombre.',
  MAQUINARIA_DUPLICADA: 'Ya existe maquinaria con ese identificador.',
  MATERIAL_DUPLICADO: 'Ya existe un material de empaque con ese nombre.',
  TRABAJADOR_NO_ENCONTRADO: 'El trabajador no existe.',
  TRABAJADOR_INACTIVO: 'El trabajador está inactivo y no puede recibir implementos.',
  IMPLEMENTO_NO_ENCONTRADO: 'El implemento no existe.',
  ELEMENTO_NO_ENCONTRADO: 'El elemento no existe.',
  CANTIDAD_INSUFICIENTE: 'Cantidad insuficiente en inventario.',
  QUIMICO_VENCIDO: 'El producto químico está vencido y no admite salida.',
  LECTURA_MAQUINARIA_INVALIDA: 'La lectura del medidor no puede ser inferior a una lectura anterior.',
  RECURSO_NO_ENCONTRADO: 'La parcela, maquinaria o material no existe o está inactivo.',
  ASIGNACION_NO_ENCONTRADA: 'La asignación no existe.',
  ASIGNACION_NO_DEVOLUCION: 'La asignación ya fue devuelta.',
  TIENE_DEPENDENCIAS: 'No se puede eliminar: tiene movimientos o asignaciones.',
  ERROR_INTERNO: 'Ocurrió un error inesperado. Intente de nuevo.',
};

export const ESTADO_HTTP: Record<CodigoError, number> = {
  DATOS_INVALIDOS: 400,
  NO_AUTORIZADO: 401,
  DOCUMENTO_DUPLICADO: 409,
  CORREO_DUPLICADO: 409,
  IMPLEMENTO_DUPLICADO: 409,
  QUIMICO_DUPLICADO: 409,
  PARCELA_DUPLICADA: 409,
  MAQUINARIA_DUPLICADA: 409,
  MATERIAL_DUPLICADO: 409,
  TRABAJADOR_NO_ENCONTRADO: 404,
  TRABAJADOR_INACTIVO: 409,
  IMPLEMENTO_NO_ENCONTRADO: 404,
  ELEMENTO_NO_ENCONTRADO: 404,
  CANTIDAD_INSUFICIENTE: 409,
  QUIMICO_VENCIDO: 409,
  LECTURA_MAQUINARIA_INVALIDA: 409,
  RECURSO_NO_ENCONTRADO: 404,
  ASIGNACION_NO_ENCONTRADA: 404,
  ASIGNACION_NO_DEVOLUCION: 409,
  TIENE_DEPENDENCIAS: 409,
  ERROR_INTERNO: 500,
};

export class ErrorDeNegocio extends Error {
  constructor(
    public codigo: CodigoError,
    mensaje?: string,
    public detalles?: unknown,
  ) {
    super(mensaje ?? MENSAJES[codigo]);
    this.name = 'ErrorDeNegocio';
  }
}
