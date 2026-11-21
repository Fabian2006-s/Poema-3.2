import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mostrarRegistroPublico } from './registro';

const mocks = vi.hoisted(() => ({
  hayUsuariosLogin: vi.fn(async () => false),
}));

vi.mock('@/lib/datos/usuariosLogin', () => ({
  hayUsuariosLogin: mocks.hayUsuariosLogin,
}));

describe('visibilidad del registro público', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hayUsuariosLogin.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('mantiene el registro disponible en desarrollo local', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');

    await expect(mostrarRegistroPublico()).resolves.toBe(true);
    expect(mocks.hayUsuariosLogin).not.toHaveBeenCalled();
  });

  it('muestra la opción de alta inicial en producción si no hay cuentas', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');

    await expect(mostrarRegistroPublico()).resolves.toBe(true);
    expect(mocks.hayUsuariosLogin).toHaveBeenCalledOnce();
  });

  it('oculta el registro público de producción después del alta inicial', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    mocks.hayUsuariosLogin.mockResolvedValue(true);

    await expect(mostrarRegistroPublico()).resolves.toBe(false);
  });
});
