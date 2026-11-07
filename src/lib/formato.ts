import { deCentesimas } from '@/lib/reglas/cantidades';

export function formatearCantidadQuimico(centesimas: number, unidad: string): string {
  const cantidad = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(deCentesimas(centesimas));
  return `${cantidad} ${unidad}`;
}

export function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${fecha}T00:00:00.000Z`));
}
