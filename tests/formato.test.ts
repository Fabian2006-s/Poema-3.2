import { describe, expect, it } from 'vitest';
import { formatearCantidadQuimico, formatearFecha } from '@/lib/formato';

describe('formato de datos de finca', () => {
  it('muestra la cantidad decimal de químicos en formato colombiano', () => {
    expect(formatearCantidadQuimico(1.5, 'litros')).toBe('1,5 litros');
  });

  it('muestra las fechas en formato colombiano sin cambiar el día', () => {
    expect(formatearFecha('2026-11-07')).toBe('7/11/2026');
  });
});
