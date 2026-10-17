import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  buscarTokenVigentePorHash: vi.fn(),
  cambiarContrasenaUsuario: vi.fn(),
  invalidarTokensPendientes: vi.fn(),
  liberarReservaToken: vi.fn(),
  marcarTokenComoUsado: vi.fn(),
  reservarTokenVigente: vi.fn(),
}));

vi.mock('@/lib/dataService', () => ({
  buscarTokenVigentePorHash: mocks.buscarTokenVigentePorHash,
  cambiarContrasenaUsuario: mocks.cambiarContrasenaUsuario,
  invalidarTokensPendientes: mocks.invalidarTokensPendientes,
  liberarReservaToken: mocks.liberarReservaToken,
  marcarTokenComoUsado: mocks.marcarTokenComoUsado,
  reservarTokenVigente: mocks.reservarTokenVigente,
}));

import { POST } from './route';

const tokenValido = 'a'.repeat(64);

function crearSolicitud(cuerpo: unknown): Request {
  return new Request('http://localhost/api/auth/restablecer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.buscarTokenVigentePorHash.mockResolvedValue({ id: 'reset-id', usuarioId: 'usr_001' });
  mocks.cambiarContrasenaUsuario.mockResolvedValue(true);
  mocks.reservarTokenVigente.mockResolvedValue(true);
  mocks.liberarReservaToken.mockResolvedValue(undefined);
  mocks.marcarTokenComoUsado.mockResolvedValue(undefined);
  mocks.invalidarTokensPendientes.mockResolvedValue(undefined);
});

describe('POST /api/auth/restablecer', () => {
  it('rechaza un enlace no vigente', async () => {
    mocks.buscarTokenVigentePorHash.mockResolvedValue(undefined);

    const respuesta = await POST(
      crearSolicitud({ token: tokenValido, contrasena: 'clave-nueva-123', confirmacion: 'clave-nueva-123' }),
    );

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El enlace no es válido o ya venció.' });
    expect(mocks.cambiarContrasenaUsuario).not.toHaveBeenCalled();
  });

  it('cambia la contraseña, consume el token e invalida los demás', async () => {
    const respuesta = await POST(
      crearSolicitud({ token: tokenValido, contrasena: 'clave-nueva-123', confirmacion: 'clave-nueva-123' }),
    );

    expect(respuesta.status).toBe(200);
    expect(mocks.buscarTokenVigentePorHash).toHaveBeenCalledWith(expect.not.stringMatching(tokenValido));
    expect(mocks.cambiarContrasenaUsuario).toHaveBeenCalledWith('usr_001', 'clave-nueva-123');
    expect(mocks.reservarTokenVigente).toHaveBeenCalledWith('reset-id');
    expect(mocks.marcarTokenComoUsado).toHaveBeenCalledWith('reset-id');
    expect(mocks.invalidarTokensPendientes).toHaveBeenCalledWith('usr_001');
  });

  it('rechaza contraseñas que no coinciden', async () => {
    const respuesta = await POST(
      crearSolicitud({ token: tokenValido, contrasena: 'clave-nueva-123', confirmacion: 'otra-clave-123' }),
    );

    expect(respuesta.status).toBe(400);
    expect(mocks.buscarTokenVigentePorHash).not.toHaveBeenCalled();
  });

  it('rechaza un token ya reservado por otro envío', async () => {
    mocks.reservarTokenVigente.mockResolvedValue(false);

    const respuesta = await POST(
      crearSolicitud({ token: tokenValido, contrasena: 'clave-nueva-123', confirmacion: 'clave-nueva-123' }),
    );

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: 'El enlace no es válido o ya venció.' });
    expect(mocks.cambiarContrasenaUsuario).not.toHaveBeenCalled();
  });

  it('libera el enlace si no pudo actualizar la contraseña', async () => {
    mocks.cambiarContrasenaUsuario.mockResolvedValue(false);

    const respuesta = await POST(
      crearSolicitud({ token: tokenValido, contrasena: 'clave-nueva-123', confirmacion: 'clave-nueva-123' }),
    );

    expect(respuesta.status).toBe(400);
    expect(mocks.liberarReservaToken).toHaveBeenCalledWith('reset-id');
    expect(mocks.marcarTokenComoUsado).not.toHaveBeenCalled();
  });
});