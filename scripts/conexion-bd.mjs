import { createRequire } from 'node:module';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const { loadEnvConfig: cargarVariables } = require('@next/env');

cargarVariables(process.cwd());

export function crearPool() {
  const connectionString =
    process.env.POEMA32_POSTGRES_URL_NON_POOLING ?? process.env.POEMA32_POSTGRES_PRISMA_URL;
  if (!connectionString) {
    throw new Error(
      'Falta POEMA32_POSTGRES_URL_NON_POOLING o POEMA32_POSTGRES_PRISMA_URL en el entorno.',
    );
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('La URL de conexión a Postgres no es válida.');
  }
  if (process.env.POEMA32_POSTGRES_URL_NON_POOLING && url.port !== '5432') {
    throw new Error('POEMA32_POSTGRES_URL_NON_POOLING debe usar el puerto 5432.');
  }
  if (!process.env.POEMA32_POSTGRES_URL_NON_POOLING && url.port !== '6543') {
    throw new Error('POEMA32_POSTGRES_PRISMA_URL debe usar el pooler de Supabase (puerto 6543).');
  }

  // Keep the explicit TLS policy below; pg-connection-string otherwise overrides it from sslmode.
  url.searchParams.delete('sslmode');

  return new Pool({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}
