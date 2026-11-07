import { describe, expect, it } from 'vitest';
import {
  estadoElemento,
  hayInventarioBajo,
  nivelVencimiento,
} from '@/lib/reglas/alertas';
import { estaVencido } from '@/lib/reglas/fechas';

const hoy = '2026-06-15';

describe('alertas y estados derivados', () => {
  it('T-16 no marca bajo un inventario mayor que el mínimo', () => {
    expect(hayInventarioBajo(6, 5)).toBe(false);
  });

  it('T-17 marca bajo cuando disponible iguala el mínimo', () => {
    expect(hayInventarioBajo(5, 5)).toBe(true);
  });

  it('T-18 marca bajo cuando disponible es menor que el mínimo', () => {
    expect(hayInventarioBajo(4, 5)).toBe(true);
  });

  it('T-19 marca bajo cuando disponible y mínimo son cero', () => {
    expect(hayInventarioBajo(0, 0)).toBe(true);
  });

  it('T-20 marca vigente un producto con 35 días restantes', () => {
    expect(nivelVencimiento('2026-07-20', hoy, 30)).toBe('vigente');
  });

  it('T-21 marca próximo con 30 días exactos', () => {
    expect(nivelVencimiento('2026-07-15', hoy, 30)).toBe('proximo');
  });

  it('T-22 marca próximo con un día restante', () => {
    expect(nivelVencimiento('2026-06-16', hoy, 30)).toBe('proximo');
  });

  it('T-23 marca próximo cuando vence hoy', () => {
    expect(nivelVencimiento(hoy, hoy, 30)).toBe('proximo');
  });

  it('T-24 marca vencido un producto con fecha pasada', () => {
    expect(nivelVencimiento('2026-06-14', hoy, 30)).toBe('vencido');
  });

  it('T-25 detecta fecha vencida', () => {
    expect(estaVencido('2026-06-14', hoy)).toBe(true);
  });

  it('T-26 no considera vencida la fecha de hoy', () => {
    expect(estaVencido(hoy, hoy)).toBe(false);
  });

  it('T-27 marca agotado un implemento sin unidades', () => {
    expect(estadoElemento({ tipo: 'implemento', disponible: 0, inactivo: false, hoy })).toBe(
      'agotado',
    );
  });

  it('T-28 marca disponible un implemento con unidades', () => {
    expect(estadoElemento({ tipo: 'implemento', disponible: 3, inactivo: false, hoy })).toBe(
      'disponible',
    );
  });

  it('T-29 prioriza vencido para un químico vencido', () => {
    expect(
      estadoElemento({
        tipo: 'quimico',
        disponible: 3,
        inactivo: false,
        fechaVencimiento: '2026-06-14',
        hoy,
      }),
    ).toBe('vencido');
  });

  it('T-30 prioriza inactivo para un elemento desactivado', () => {
    expect(
      estadoElemento({
        tipo: 'quimico',
        disponible: 3,
        inactivo: true,
        fechaVencimiento: '2026-06-14',
        hoy,
      }),
    ).toBe('inactivo');
  });
});
