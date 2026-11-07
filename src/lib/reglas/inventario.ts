import { esFechaValida } from '@/lib/reglas/fechas';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type TipoElemento = 'implemento' | 'quimico';
export type TipoMovimiento = 'entrada' | 'salida';

export function validarCantidadMovimiento(cantidad: number, tipo: TipoElemento): void {
  if (
    !Number.isFinite(cantidad) ||
    cantidad <= 0 ||
    (tipo === 'implemento' && !Number.isInteger(cantidad))
  ) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
}

export function validarMotivoYFecha(motivo: string, fecha: string): void {
  if (!motivo.trim() || !esFechaValida(fecha)) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
}

export function nuevaCantidad(
  disponible: number,
  tipo: TipoMovimiento,
  cantidad: number,
): number {
  if (tipo === 'entrada') return disponible + cantidad;
  if (cantidad > disponible) throw new ErrorDeNegocio('CANTIDAD_INSUFICIENTE');
  return disponible - cantidad;
}
