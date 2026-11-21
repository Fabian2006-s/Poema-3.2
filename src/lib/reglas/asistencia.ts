export type EstadoAsistencia = 'asistio' | 'falta' | 'permiso' | 'incapacidad';

export function minutosAsistenciaValidos(
  estado: EstadoAsistencia,
  minutos: number,
): boolean {
  if (!Number.isInteger(minutos) || minutos < 0 || minutos > 1440) return false;
  return estado === 'asistio' || minutos === 0;
}
