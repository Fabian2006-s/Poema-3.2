import { describe, expect, it } from 'vitest';
import { minutosAsistenciaValidos } from '@/lib/reglas/asistencia';
import { validarLecturaNoRegresiva } from '@/lib/reglas/maquinaria';
import { siguienteExistenciaMaterial } from '@/lib/reglas/materiales';
import { esperarCodigo } from './ayudas';

describe('reglas de gestión operativa', () => {
  it('solo permite minutos en una asistencia y limita la jornada a 24 horas', () => {
    expect(minutosAsistenciaValidos('asistio', 480)).toBe(true);
    expect(minutosAsistenciaValidos('falta', 0)).toBe(true);
    expect(minutosAsistenciaValidos('permiso', 30)).toBe(false);
    expect(minutosAsistenciaValidos('asistio', 1441)).toBe(false);
  });

  it('no permite que una lectura de maquinaria retroceda', () => {
    expect(() => validarLecturaNoRegresiva(1200, 1000)).not.toThrow();
    esperarCodigo(() => validarLecturaNoRegresiva(999, 1000), 'LECTURA_MAQUINARIA_INVALIDA');
  });

  it('actualiza el inventario de materiales y rechaza salidas mayores al saldo', () => {
    expect(siguienteExistenciaMaterial(8, 'entrada', 3)).toBe(11);
    expect(siguienteExistenciaMaterial(8, 'salida', 3)).toBe(5);
    esperarCodigo(
      () => siguienteExistenciaMaterial(2, 'salida', 3),
      'CANTIDAD_INSUFICIENTE',
    );
  });
});
