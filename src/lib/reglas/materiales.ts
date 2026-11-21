import { CANTIDAD_MAXIMA } from '@/lib/config/finca';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type TipoMovimientoMaterial = 'entrada' | 'salida';

export function siguienteExistenciaMaterial(
  disponible: number,
  tipo: TipoMovimientoMaterial,
  cantidad: number,
): number {
  if (
    !Number.isSafeInteger(disponible) ||
    disponible < 0 ||
    !Number.isSafeInteger(cantidad) ||
    cantidad <= 0
  ) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }

  const siguiente = tipo === 'entrada' ? disponible + cantidad : disponible - cantidad;
  if (siguiente < 0) throw new ErrorDeNegocio('CANTIDAD_INSUFICIENTE');
  if (siguiente > CANTIDAD_MAXIMA) throw new ErrorDeNegocio('DATOS_INVALIDOS');
  return siguiente;
}
