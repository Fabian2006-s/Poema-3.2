import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearPool } from './conexion-bd.mjs';

const directorioMigraciones = fileURLToPath(new URL('../supabase/migrations/', import.meta.url));
const pool = crearPool();

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public._migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const archivos = (await readdir(directorioMigraciones))
    .filter((nombre) => nombre.endsWith('.sql'))
    .sort();
  const { rows: aplicadas } = await pool.query('SELECT name FROM public._migrations');
  const conjuntoAplicadas = new Set(aplicadas.map(({ name }) => name));

  for (const nombre of archivos) {
    if (conjuntoAplicadas.has(nombre)) {
      console.log(`OMITIDA ${nombre}`);
      continue;
    }

    const sql = await readFile(path.join(directorioMigraciones, nombre), 'utf8');
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      await cliente.query(sql);
      await cliente.query('INSERT INTO public._migrations (name) VALUES ($1)', [nombre]);
      await cliente.query('COMMIT');
      console.log(`APLICADA ${nombre}`);
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw new Error(`Falló la migración ${nombre}.`, { cause: error });
    } finally {
      cliente.release();
    }
  }
} catch (error) {
  console.error('Error al ejecutar las migraciones:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
