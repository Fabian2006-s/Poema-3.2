export function aCentesimas(valorDecimal: number): number {
  return Math.round(valorDecimal * 100);
}

export function deCentesimas(centesimas: number): number {
  return centesimas / 100;
}

export function esEnteroNoNegativo(n: number): boolean {
  return Number.isSafeInteger(n) && n >= 0;
}

export function esDecimalNoNegativo(n: number): boolean {
  return Number.isFinite(n) && n >= 0;
}
