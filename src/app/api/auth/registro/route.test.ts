import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRegisteredUser } from '@/lib/auth/users';
import { POST } from './route';

const mocks = vi.hoisted(() => ({
  registroDisponible: vi.fn(async () => true),
}));

vi.mock('@/lib/auth/users', () => ({
  createRegisteredUser: vi.fn(async (email: string) => ({
    id: 'usr_test',
    email: email.trim().toLowerCase(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  })),
}));

vi.mock('@/lib/auth/registro', () => ({
  mostrarRegistroPublico: mocks.registroDisponible,
}));

vi.mock('@/lib/auth/session', () => ({
  createSessionToken: vi.fn(() => 'session-token'),
}));

function solicitudRegistro(): Request {
  return new Request('http://localhost/api/auth/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nueva@example.com', password: 'clave-segura-123' }),
  });
}

describe('POST /api/auth/registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.registroDisponible.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('crea la cuenta e inicia sesión en desarrollo local', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');

    const response = await POST(solicitudRegistro());

    expect(response.status).toBe(201);
    expect(response.headers.get('set-cookie')).toContain('poema_session=session-token');
    expect(createRegisteredUser).toHaveBeenCalledWith('nueva@example.com', 'clave-segura-123');
  });

  it('permite crear la cuenta inicial en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');

    const response = await POST(solicitudRegistro());

    expect(response.status).toBe(201);
    expect(createRegisteredUser).toHaveBeenCalledWith('nueva@example.com', 'clave-segura-123');
  });

  it('rechaza el registro cuando ya existe una cuenta', async () => {
    mocks.registroDisponible.mockResolvedValue(false);

    const response = await POST(solicitudRegistro());

    expect(response.status).toBe(403);
    expect(createRegisteredUser).not.toHaveBeenCalled();
  });

  it('rechaza un registro concurrente si otra cuenta se creó primero', async () => {
    vi.mocked(createRegisteredUser).mockResolvedValueOnce(null);

    const response = await POST(solicitudRegistro());

    expect(response.status).toBe(403);
  });
});
