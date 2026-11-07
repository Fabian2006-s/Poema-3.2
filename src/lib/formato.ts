export function formatearCantidadQuimico(cantidad: number, unidad: string): string {
  const formateado = new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(cantidad);
  const singulares: Record<string, string> = {
    gramos: 'gramo',
    kilogramos: 'kilogramo',
    litros: 'litro',
    mililitros: 'mililitro',
    unidades: 'unidad',
  };
  const unidadVisible =
    cantidad === 1 ? (singulares[unidad.toLocaleLowerCase('es-CO')] ?? unidad) : unidad;
  return `${formateado} ${unidadVisible}`;
}

export function formatearFecha(fecha: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${fecha}T00:00:00.000Z`));
}
