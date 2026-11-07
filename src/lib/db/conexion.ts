import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';

types.setTypeParser(1082, (valor) => valor);
types.setTypeParser(1114, (valor) => valor);
types.setTypeParser(1184, (valor) => valor);
types.setTypeParser(20, (valor) => Number.parseInt(valor, 10));

type GlobalConPool = typeof globalThis & { poolFinca?: Pool };
const globalConPool = globalThis as GlobalConPool;

function obtenerUrlConexion(): string {
  const connectionString = process.env.POEMA32_POSTGRES_PRISMA_URL;
  if (!connectionString) {
    throw new Error('Falta POEMA32_POSTGRES_PRISMA_URL para conectar con Postgres.');
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('POEMA32_POSTGRES_PRISMA_URL no es una URL válida.');
  }
  if (url.port !== '6543') {
    throw new Error('POEMA32_POSTGRES_PRISMA_URL debe usar el pooler de Supabase (puerto 6543).');
  }

  url.searchParams.delete('sslmode');
  return url.toString();
}

export const pool =
  globalConPool.poolFinca ??
  new Pool({
    connectionString: obtenerUrlConexion(),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== 'production') globalConPool.poolFinca = pool;

export async function consultar<T extends QueryResultRow>(
  sql: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const { rows } = await pool.query<T>(sql, valores);
  return rows;
}

export async function conTransaccion<T>(
  trabajo: (tx: PoolClient) => Promise<T>,
): Promise<T> {
  const tx = await pool.connect();
  try {
    await tx.query('BEGIN');
    const resultado = await trabajo(tx);
    await tx.query('COMMIT');
    return resultado;
  } catch (error) {
    await tx.query('ROLLBACK');
    throw error;
  } finally {
    tx.release();
  }
}
