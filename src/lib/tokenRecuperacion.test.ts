import { describe, expect, it } from 'vitest';
import { calcularHashToken, generarToken } from './tokenRecuperacion';

describe('tokens de recuperación', () => {
  it('genera 32 bytes en hexadecimal y calcula SHA-256 estable', () => {
    const token = generarToken();

    expect(token).toMatch(/^[a-f\d]{64}$/);
    expect(calcularHashToken(token)).toMatch(/^[a-f\d]{64}$/);
    expect(calcularHashToken(token)).toBe(calcularHashToken(token));
    expect(calcularHashToken(token)).not.toBe(token);
  });
});