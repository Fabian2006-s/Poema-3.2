export function formatearCantidadQuimico(cantidad: number, unidad: string): string {
  const formateado = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(cantidad);
  return `${formateado} ${unidad}`;
}

export function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${fecha}T00:00:00.000Z`));
}
