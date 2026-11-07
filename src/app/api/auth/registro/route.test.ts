import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser } from '@/lib/auth/users';
import { POST } from './route';

vi.mock('@/lib/auth/users', () => ({
  createUser: vi.fn(async (email: string) => ({
    id: 'usr_test',
    email: email.trim().toLowerCase(),
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  })),
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
    expect(createUser).toHaveBeenCalledWith('nueva@example.com', 'clave-segura-123');
  });

  it('rechaza el registro público en producción', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');

    const response = await POST(solicitudRegistro());

    expect(response.status).toBe(403);
    expect(createUser).not.toHaveBeenCalled();
  });
});
