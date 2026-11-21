import { describe, expect, it } from 'vitest';
import { esquemaOperacion } from '@/lib/validacion/esquemas';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('validación de gestión operativa', () => {
  it('solo permite registrar minutos cuando el trabajador asistió', () => {
    const datos = {
      tipo: 'registrar_asistencia',
      trabajadorId: uuid,
      fecha: '2026-06-01',
      estado: 'falta',
      minutosTrabajados: 60,
    };

    expect(esquemaOperacion.safeParse(datos).success).toBe(false);
    expect(
      esquemaOperacion.safeParse({ ...datos, minutosTrabajados: 0 }).success,
    ).toBe(true);
  });

  it('limita el volumen de riego a dos decimales y exige una cantidad positiva', () => {
    const datos = {
      tipo: 'registrar_riego',
      parcelaId: uuid,
      fecha: '2026-06-01',
      metodo: 'Goteo',
      duracionMinutos: 30,
      volumenM3: 0.01,
    };

    expect(esquemaOperacion.safeParse(datos).success).toBe(true);
    expect(esquemaOperacion.safeParse({ ...datos, volumenM3: 0 }).success).toBe(false);
    expect(esquemaOperacion.safeParse({ ...datos, volumenM3: 0.001 }).success).toBe(false);
  });

  it('exige lectura para registrar uso de maquinaria, pero no para mantenimiento', () => {
    const datos = {
      tipo: 'registrar_maquinaria',
      maquinariaId: uuid,
      fecha: '2026-06-01',
      costoCop: 0,
      detalle: 'Revisión preventiva',
    };

    expect(
      esquemaOperacion.safeParse({ ...datos, tipoRegistro: 'uso' }).success,
    ).toBe(false);
    expect(
      esquemaOperacion.safeParse({ ...datos, tipoRegistro: 'mantenimiento' }).success,
    ).toBe(true);
  });

  it('acepta dinero en pesos enteros y rechaza valores fraccionarios', () => {
    const datos = {
      tipo: 'registrar_venta',
      parcelaId: uuid,
      fecha: '2026-06-01',
      cliente: 'Comprador',
      cajas: 10,
      valorCop: 100000,
    };

    expect(esquemaOperacion.safeParse(datos).success).toBe(true);
    expect(esquemaOperacion.safeParse({ ...datos, valorCop: 100000.5 }).success).toBe(false);
  });
});
