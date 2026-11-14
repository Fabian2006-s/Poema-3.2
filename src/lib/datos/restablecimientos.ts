import { randomUUID } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import { consultar, conTransaccion } from '@/lib/db/conexion';

export type RegistroRestablecimiento = {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiraEn: string;
  usadoEn: string | null;
  creadoEn: string;
};

type RegistroRestablecimientoFila = QueryResultRow & {
  id: string;
  usuario_id: string;
  token_hash: string;
  expira_en: string;
  usado_en: string | null;
  creado_en: string;
};

function mapearRegistro(fila: RegistroRestablecimientoFila): RegistroRestablecimiento {
  return {
    id: fila.id,
    usuarioId: fila.usuario_id,
    tokenHash: fila.token_hash,
    expiraEn: fila.expira_en,
    usadoEn: fila.usado_en,
    creadoEn: fila.creado_en,
  };
}

export async function contarSolicitudesRecientesPostgres(usuarioId: string): Promise<number> {
  const filas = await consultar<{ total: number } & QueryResultRow>(
    `SELECT COUNT(*)::INTEGER AS total
       FROM solicitudes_recuperacion
      WHERE usuario_id = $1
        AND creado_en > NOW() - INTERVAL '15 minutes'`,
    [usuarioId],
  );
  return filas[0]?.total ?? 0;
}

export async function registrarSolicitudPostgresSiPermitida(usuarioId: string): Promise<boolean> {
  return conTransaccion(async (tx) => {
    await tx.query('SELECT pg_advisory_xact_lock(hashtext($1)::bigint)', [
      `poema:recuperacion:${usuarioId}`,
    ]);
    await tx.query(
      `DELETE FROM solicitudes_recuperacion
        WHERE usuario_id = $1
          AND creado_en <= NOW() - INTERVAL '15 minutes'`,
      [usuarioId],
    );
    const filas = await tx.query<{ total: number } & QueryResultRow>(
      `SELECT COUNT(*)::INTEGER AS total
         FROM solicitudes_recuperacion
        WHERE usuario_id = $1
          AND creado_en > NOW() - INTERVAL '15 minutes'`,
      [usuarioId],
    );
    if ((filas.rows[0]?.total ?? 0) >= 3) return false;

    await tx.query(
      'INSERT INTO solicitudes_recuperacion (id, usuario_id) VALUES ($1, $2)',
      [randomUUID(), usuarioId],
    );
    return true;
  });
}

export async function invalidarTokensPendientesPostgres(usuarioId: string): Promise<void> {
  await consultar(
    `UPDATE tokens_recuperacion
        SET usado_en = NOW(), reserva_expira_en = NULL
      WHERE usuario_id = $1 AND usado_en IS NULL`,
    [usuarioId],
  );
}

export async function crearTokenRestablecimientoPostgres(
  usuarioId: string,
  tokenHash: string,
  expiraEn: Date,
): Promise<void> {
  await consultar(
    `INSERT INTO tokens_recuperacion (id, usuario_id, token_hash, expira_en)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), usuarioId, tokenHash, expiraEn.toISOString()],
  );
}

export async function buscarTokenVigentePorHashPostgres(
  tokenHash: string,
): Promise<RegistroRestablecimiento | undefined> {
  const filas = await consultar<RegistroRestablecimientoFila>(
    `SELECT id, usuario_id, token_hash, expira_en, usado_en, creado_en
       FROM tokens_recuperacion
      WHERE token_hash = $1
        AND usado_en IS NULL
        AND expira_en > NOW()
      LIMIT 1`,
    [tokenHash],
  );
  return filas[0] ? mapearRegistro(filas[0]) : undefined;
}

export async function marcarTokenComoUsadoPostgres(id: string): Promise<void> {
  await consultar(
    `UPDATE tokens_recuperacion
        SET usado_en = NOW(), reserva_expira_en = NULL
      WHERE id = $1 AND usado_en IS NULL AND expira_en > NOW()`,
    [id],
  );
}

export async function reservarTokenVigentePostgres(id: string): Promise<boolean> {
  const filas = await consultar<{ id: string } & QueryResultRow>(
    `UPDATE tokens_recuperacion
        SET reserva_expira_en = NOW() + INTERVAL '30 minutes'
      WHERE id = $1
        AND usado_en IS NULL
        AND expira_en > NOW()
        AND (reserva_expira_en IS NULL OR reserva_expira_en <= NOW())
      RETURNING id`,
    [id],
  );
  return Boolean(filas[0]);
}

export async function liberarReservaTokenPostgres(id: string): Promise<void> {
  await consultar(
    `UPDATE tokens_recuperacion
        SET reserva_expira_en = NULL
      WHERE id = $1 AND usado_en IS NULL`,
    [id],
  );
}
