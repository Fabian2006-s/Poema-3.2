import { describe, expect, it } from 'vitest';
import { aCentesimas, deCentesimas } from '@/lib/reglas/cantidades';

describe('cantidades en centésimas', () => {
  it('T-01 convierte 2.5 a 250 centésimas', () => {
    expect(aCentesimas(2.5)).toBe(250);
  });

  it('T-02 convierte 1.5 a 150 centésimas', () => {
    expect(aCentesimas(1.5)).toBe(150);
  });

  it('T-03 convierte 250 centésimas a 2.5', () => {
    expect(deCentesimas(250)).toBe(2.5);
  });

  it('T-04 resta 2.5 − 1.5 y obtiene 1.0 exacto', () => {
    expect(deCentesimas(aCentesimas(2.5) - aCentesimas(1.5))).toBe(1);
  });

  it('T-05 resta en centésimas hasta obtener 0 exacto', () => {
    expect(aCentesimas(2.5) - aCentesimas(1.5) - aCentesimas(1)).toBe(0);
  });
});
