import type { QueryResultRow } from 'pg';
import { consultar, conTransaccion } from '@/lib/db/conexion';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type UsuarioLogin = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

type UsuarioLoginFila = QueryResultRow & {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

function mapearUsuario(fila: UsuarioLoginFila): UsuarioLogin {
  return {
    id: fila.id,
    email: fila.email,
    passwordHash: fila.password_hash,
    createdAt: fila.created_at,
    updatedAt: fila.updated_at,
  };
}

function esUnicoDuplicado(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}

export async function buscarUsuarioLoginPorCorreo(email: string): Promise<UsuarioLogin | undefined> {
  const filas = await consultar<UsuarioLoginFila>(
    `SELECT id, email, password_hash, created_at, updated_at
       FROM usuarios_login
      WHERE lower(email) = $1
      LIMIT 1`,
    [email.trim().toLowerCase()],
  );
  return filas[0] ? mapearUsuario(filas[0]) : undefined;
}

export async function hayUsuariosLogin(): Promise<boolean> {
  const filas = await consultar<{ existe: boolean } & QueryResultRow>(
    'SELECT EXISTS (SELECT 1 FROM usuarios_login) AS existe',
  );
  return filas[0]?.existe ?? false;
}

export async function crearUsuarioInicialSiVacio(
  usuario: UsuarioLogin | null,
): Promise<void> {
  await conTransaccion(async (tx) => {
    await tx.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', ['poema:usuario-inicial']);
    const resultado = await tx.query<{ existe: boolean } & QueryResultRow>(
      'SELECT EXISTS (SELECT 1 FROM usuarios_login) AS existe',
    );
    if (resultado.rows[0]?.existe) return;
    if (!usuario) {
      throw new Error(
        'Configura DEMO_USER_EMAIL y DEMO_USER_PASSWORD para crear la cuenta inicial.',
      );
    }

    await tx.query(
      `INSERT INTO usuarios_login (id, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuario.id, usuario.email, usuario.passwordHash, usuario.createdAt, usuario.updatedAt],
    );
  });
}

export async function guardarUsuarioLogin(usuario: UsuarioLogin): Promise<void> {
  try {
    await consultar(
      `INSERT INTO usuarios_login (id, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuario.id, usuario.email, usuario.passwordHash, usuario.createdAt, usuario.updatedAt],
    );
  } catch (error) {
    if (esUnicoDuplicado(error)) throw new ErrorDeNegocio('CORREO_DUPLICADO');
    throw error;
  }
}

export async function actualizarHashUsuarioLoginPorCorreo(
  email: string,
  passwordHash: string,
): Promise<boolean> {
  const filas = await consultar<{ id: string } & QueryResultRow>(
    `UPDATE usuarios_login
        SET password_hash = $1, updated_at = NOW()
      WHERE lower(email) = $2
      RETURNING id`,
    [passwordHash, email.trim().toLowerCase()],
  );
  return Boolean(filas[0]);
}

export async function actualizarHashUsuarioLoginPorId(
  id: string,
  passwordHash: string,
): Promise<boolean> {
  const filas = await consultar<{ id: string } & QueryResultRow>(
    `UPDATE usuarios_login
        SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id`,
    [passwordHash, id],
  );
  return Boolean(filas[0]);
}
