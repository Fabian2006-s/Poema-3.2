import { ZONA_HORARIA } from '@/lib/config/finca';

export function hoyBogota(reloj: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reloj);
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

export function esFechaValida(fecha: string): boolean {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!coincidencia) return false;

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  if (anio < 100 || mes < 1 || mes > 12 || dia < 1) return false;

  const bisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
  const diasPorMes = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dia <= (diasPorMes[mes - 1] ?? 0);
}

export function diasEntre(desde: string, hasta: string): number {
  const convertir = (fecha: string): number => {
    const anio = Number(fecha.slice(0, 4));
    const mes = Number(fecha.slice(5, 7));
    const dia = Number(fecha.slice(8, 10));
    return Date.UTC(anio, mes - 1, dia) / 86_400_000;
  };
  return convertir(hasta) - convertir(desde);
}

export function estaVencido(fechaVencimiento: string, hoy: string): boolean {
  return fechaVencimiento < hoy;
}
