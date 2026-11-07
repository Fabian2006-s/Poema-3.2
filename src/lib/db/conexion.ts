import { Pool, types, type PoolClient, type QueryResultRow } from 'pg';

types.setTypeParser(1082, (valor) => valor);
types.setTypeParser(1114, (valor) => valor);
types.setTypeParser(1184, (valor) => valor);
types.setTypeParser(20, (valor) => Number.parseInt(valor, 10));

type GlobalConPool = typeof globalThis & { poolFinca: Pool | undefined };
const globalConPool = globalThis as GlobalConPool;
let poolLocal: Pool | undefined;

function obtenerUrlConexion(): string {
  const usarPooler = process.env.NODE_ENV === 'production';
  const nombreVariable = usarPooler
    ? 'POEMA32_POSTGRES_PRISMA_URL'
    : 'POEMA32_POSTGRES_URL_NON_POOLING';
  const connectionString = usarPooler
    ? process.env.POEMA32_POSTGRES_PRISMA_URL
    : (process.env.POEMA32_POSTGRES_URL_NON_POOLING ??
      process.env.POEMA32_POSTGRES_PRISMA_URL);
  if (!connectionString) {
    throw new Error(`Falta ${nombreVariable} para conectar con Postgres.`);
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(`${nombreVariable} no es una URL válida.`);
  }
  const puertoEsperado = usarPooler || !process.env.POEMA32_POSTGRES_URL_NON_POOLING ? '6543' : '5432';
  if (url.port !== puertoEsperado) {
    throw new Error(
      `${nombreVariable} debe usar ${puertoEsperado === '6543' ? 'el pooler (6543)' : 'la conexión directa (5432)'}.`,
    );
  }

  url.searchParams.delete('sslmode');
  return url.toString();
}

export function obtenerPool(): Pool {
  const poolCompartido = globalConPool.poolFinca;
  if (poolCompartido) return poolCompartido;
  if (poolLocal) return poolLocal;

  poolLocal = new Pool({
    connectionString: obtenerUrlConexion(),
    ssl: { rejectUnauthorized: false },
    max: 3,
    idleTimeoutMillis: 10_000,
  });
  if (process.env.NODE_ENV !== 'production') globalConPool.poolFinca = poolLocal;
  return poolLocal;
}

export async function cerrarPool(): Promise<void> {
  const poolActual = poolLocal ?? globalConPool.poolFinca;
  if (!poolActual) return;
  await poolActual.end();
  poolLocal = undefined;
  globalConPool.poolFinca = undefined;
}

export async function consultar<T extends QueryResultRow>(
  sql: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const { rows } = await obtenerPool().query<T>(sql, valores);
  return rows;
}

export async function conTransaccion<T>(
  trabajo: (tx: PoolClient) => Promise<T>,
): Promise<T> {
  const tx = await obtenerPool().connect();
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
