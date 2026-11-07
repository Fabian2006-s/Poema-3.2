import { describe, expect, it } from 'vitest';
import { nuevaCantidad, validarCantidadMovimiento, validarMotivoYFecha } from '@/lib/reglas/inventario';
import { esperarCodigo } from './ayudas';

describe('reglas de movimientos', () => {
  it('T-06 suma una entrada', () => {
    expect(nuevaCantidad(10, 'entrada', 5)).toBe(15);
  });

  it('T-07 resta una salida', () => {
    expect(nuevaCantidad(10, 'salida', 4)).toBe(6);
  });

  it('T-08 permite agotar exactamente el inventario', () => {
    expect(nuevaCantidad(10, 'salida', 10)).toBe(0);
  });

  it('T-09 rechaza una salida superior al inventario', () => {
    esperarCodigo(() => nuevaCantidad(10, 'salida', 11), 'CANTIDAD_INSUFICIENTE');
  });

  it('T-10 rechaza una cantidad cero para implemento', () => {
    esperarCodigo(() => validarCantidadMovimiento(0, 'implemento'), 'DATOS_INVALIDOS');
  });

  it('T-11 rechaza una cantidad negativa para químico', () => {
    esperarCodigo(() => validarCantidadMovimiento(-1, 'quimico'), 'DATOS_INVALIDOS');
  });

  it('T-12 rechaza decimales para implementos', () => {
    esperarCodigo(() => validarCantidadMovimiento(2.5, 'implemento'), 'DATOS_INVALIDOS');
  });

  it('T-13 acepta decimales para químicos', () => {
    expect(() => validarCantidadMovimiento(2.5, 'quimico')).not.toThrow();
  });

  it('T-14 rechaza un motivo vacío', () => {
    esperarCodigo(() => validarMotivoYFecha(' ', '2026-06-15'), 'DATOS_INVALIDOS');
  });

  it('T-15 rechaza una fecha inexistente', () => {
    esperarCodigo(() => validarMotivoYFecha('Uso', '2026-13-01'), 'DATOS_INVALIDOS');
  });
});
