import { describe, expect, it } from 'vitest';
import { puedeRecibirAsignacion, validarTrabajador } from '@/lib/reglas/trabajador';
import { esperarCodigo } from './ayudas';

describe('reglas de trabajadores', () => {
  it("T-31 permite asignar implementos a un trabajador 'activo'", () => {
    expect(puedeRecibirAsignacion('activo')).toBe(true);
  });

  it("T-32 no permite asignar implementos a un trabajador 'inactivo'", () => {
    expect(puedeRecibirAsignacion('inactivo')).toBe(false);
  });

  it('T-33 rechaza un documento vacío', () => {
    esperarCodigo(
      () => validarTrabajador({ nombre: 'Juan', documento: ' ', cargo: 'Operario' }),
      'DATOS_INVALIDOS',
    );
  });

  it('T-34 acepta los datos requeridos de un trabajador', () => {
    expect(() =>
      validarTrabajador({ nombre: 'Juan', documento: '123', cargo: 'Operario' }),
    ).not.toThrow();
  });
});
