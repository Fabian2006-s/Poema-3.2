import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'poema_session';
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET debe estar configurado en producción.');
  }
  return 'poema-3.2-development-session-secret';
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

export function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, expiresAt: Date.now() + sessionLifetimeSeconds * 1000 }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = Buffer.from(sign(payload));
  const actualSignature = Buffer.from(signature);
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof session.email !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }
    return session.email;
  } catch {
    return null;
  }
}

export async function getAuthenticatedEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(cookieName)?.value);
}