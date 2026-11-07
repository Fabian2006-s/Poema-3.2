import { diasEntre, esFechaValida } from '@/lib/reglas/fechas';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type NivelVencimiento = 'vigente' | 'proximo' | 'vencido';
export type EstadoElemento = 'disponible' | 'agotado' | 'vencido' | 'inactivo';

export function hayInventarioBajo(disponible: number, minima: number): boolean {
  return disponible <= minima;
}

export function nivelVencimiento(
  fechaVencimiento: string,
  hoy: string,
  diasAviso: number,
): NivelVencimiento {
  if (
    !esFechaValida(fechaVencimiento) ||
    !esFechaValida(hoy) ||
    !Number.isInteger(diasAviso) ||
    diasAviso < 0
  ) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }

  const dias = diasEntre(hoy, fechaVencimiento);
  if (dias < 0) return 'vencido';
  if (dias <= diasAviso) return 'proximo';
  return 'vigente';
}

export function estadoElemento(d: {
  tipo: 'implemento' | 'quimico';
  disponible: number;
  inactivo: boolean;
  fechaVencimiento?: string | null;
  hoy: string;
}): EstadoElemento {
  if (d.inactivo) return 'inactivo';
  if (
    d.tipo === 'quimico' &&
    d.fechaVencimiento &&
    nivelVencimiento(d.fechaVencimiento, d.hoy, 0) === 'vencido'
  ) {
    return 'vencido';
  }
  if (d.disponible <= 0) return 'agotado';
  return 'disponible';
}
