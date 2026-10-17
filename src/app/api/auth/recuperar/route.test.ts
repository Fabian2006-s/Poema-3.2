import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enviarCorreo: vi.fn(),
  buscarUsuarioPorEmail: vi.fn(),
  crearTokenRestablecimiento: vi.fn(),
  invalidarTokensPendientes: vi.fn(),
  registrarSolicitudSiPermitida: vi.fn(),
}));

vi.mock('@/lib/correo', () => ({ enviarCorreo: mocks.enviarCorreo }));
vi.mock('@/lib/dataService', () => ({
  buscarUsuarioPorEmail: mocks.buscarUsuarioPorEmail,
  crearTokenRestablecimiento: mocks.crearTokenRestablecimiento,
  invalidarTokensPendientes: mocks.invalidarTokensPendientes,
  registrarSolicitudSiPermitida: mocks.registrarSolicitudSiPermitida,
}));

import { POST } from './route';

function crearSolicitud(cuerpo: unknown): Request {
  return new Request('http://localhost/api/auth/recuperar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.enviarCorreo.mockResolvedValue({ ok: true, id: 'email-id' });
  mocks.registrarSolicitudSiPermitida.mockResolvedValue(true);
  mocks.invalidarTokensPendientes.mockResolvedValue(undefined);
  mocks.crearTokenRestablecimiento.mockResolvedValue(undefined);
});

describe('POST /api/auth/recuperar', () => {
  it('responde igual para correo no registrado y no envía correo', async () => {
    mocks.buscarUsuarioPorEmail.mockResolvedValue(undefined);

    const respuesta = await POST(crearSolicitud({ email: 'desconocido@example.com' }));

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({
      mensaje: 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.',
    });
    expect(mocks.enviarCorreo).not.toHaveBeenCalled();
  });

  it('genera un token con hash, invalida enlaces previos y envía la recuperación', async () => {
    mocks.buscarUsuarioPorEmail.mockResolvedValue({ id: 'usr_001', email: 'persona@example.com' });

    const respuesta = await POST(crearSolicitud({ email: 'persona@example.com' }));

    expect(respuesta.status).toBe(200);
    expect(mocks.invalidarTokensPendientes).toHaveBeenCalledWith('usr_001');
    const [usuarioId, tokenHash, expiracion] = mocks.crearTokenRestablecimiento.mock.calls[0] as [
      string,
      string,
      Date,
    ];
    expect(usuarioId).toBe('usr_001');
    expect(tokenHash).toMatch(/^[a-f\d]{64}$/);
    expect(expiracion.getTime()).toBeGreaterThan(Date.now() + 29 * 60 * 1000);
    expect(expiracion.getTime()).toBeLessThan(Date.now() + 31 * 60 * 1000);

    expect(mocks.enviarCorreo).toHaveBeenCalledWith(
      expect.objectContaining({ para: 'persona@example.com', asunto: 'Restablecer contraseña' }),
    );
    const html = (mocks.enviarCorreo.mock.calls[0]?.[0] as { html: string }).html;
    expect(html).toMatch(/\/restablecer-contrasena\?token=[a-f\d]{64}/);
  });

  it('no envía más de tres solicitudes en quince minutos', async () => {
    mocks.buscarUsuarioPorEmail.mockResolvedValue({ id: 'usr_001', email: 'persona@example.com' });
    mocks.registrarSolicitudSiPermitida.mockResolvedValue(false);

    const respuesta = await POST(crearSolicitud({ email: 'persona@example.com' }));

    expect(respuesta.status).toBe(200);
    expect(mocks.crearTokenRestablecimiento).not.toHaveBeenCalled();
    expect(mocks.enviarCorreo).not.toHaveBeenCalled();
  });

  it('responde de forma genérica aunque falle el envío', async () => {
    mocks.buscarUsuarioPorEmail.mockResolvedValue({ id: 'usr_001', email: 'persona@example.com' });
    mocks.enviarCorreo.mockResolvedValue({ ok: false, error: 'Resend rechazó el destinatario.' });

    const respuesta = await POST(crearSolicitud({ email: 'persona@example.com' }));

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toHaveProperty('mensaje');
  });
});