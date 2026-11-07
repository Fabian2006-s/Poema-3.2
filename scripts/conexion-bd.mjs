import { createRequire } from 'node:module';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const { loadEnvConfig: cargarVariables } = require('@next/env');

cargarVariables(process.cwd());

export function crearPool() {
  const connectionString = process.env.POEMA32_POSTGRES_PRISMA_URL;
  if (!connectionString) {
    throw new Error('Falta POEMA32_POSTGRES_PRISMA_URL en el entorno.');
  }

  let url;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('POEMA32_POSTGRES_PRISMA_URL no es una URL válida.');
  }
  if (url.port !== '6543') {
    throw new Error('POEMA32_POSTGRES_PRISMA_URL debe usar el pooler de Supabase (puerto 6543).');
  }

  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}
