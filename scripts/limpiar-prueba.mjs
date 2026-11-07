import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearPool } from './conexion-bd.mjs';

export async function limpiarDatosDeFinca(soloPruebas = false) {
  const pool = crearPool();
  const cliente = await pool.connect();
  const valores = ['Prueba %', 'Demo %', soloPruebas];
  try {
    await cliente.query('BEGIN');
    await cliente.query(
      `DELETE FROM movimientos m
        USING implementos i
        WHERE m.tipo_elemento = 'implemento'
          AND m.elemento_id = i.id
          AND (i.nombre LIKE $1 OR (NOT $3::boolean AND i.nombre LIKE $2))`,
      valores,
    );
    await cliente.query(
      `DELETE FROM movimientos m
        USING quimicos q
        WHERE m.tipo_elemento = 'quimico'
          AND m.elemento_id = q.id
          AND (q.nombre LIKE $1 OR (NOT $3::boolean AND q.nombre LIKE $2))`,
      valores,
    );
    await cliente.query(
      `DELETE FROM asignaciones a
        WHERE a.trabajador_id IN (
          SELECT id FROM trabajadores
           WHERE nombre LIKE $1 OR (NOT $3::boolean AND nombre LIKE $2)
        )
        OR a.implemento_id IN (
          SELECT id FROM implementos
           WHERE nombre LIKE $1 OR (NOT $3::boolean AND nombre LIKE $2)
        )`,
      valores,
    );
    await cliente.query(
      'DELETE FROM quimicos WHERE nombre LIKE $1 OR (NOT $3::boolean AND nombre LIKE $2)',
      valores,
    );
    await cliente.query(
      'DELETE FROM implementos WHERE nombre LIKE $1 OR (NOT $3::boolean AND nombre LIKE $2)',
      valores,
    );
    await cliente.query(
      'DELETE FROM trabajadores WHERE nombre LIKE $1 OR (NOT $3::boolean AND nombre LIKE $2)',
      valores,
    );
    await cliente.query('COMMIT');
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
    await pool.end();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const argumentos = process.argv.slice(2);
    if (argumentos.some((argumento) => argumento !== '--prueba')) {
      throw new Error('Argumento no reconocido. Use --prueba para conservar los datos demo.');
    }
    const soloPruebas = argumentos.includes('--prueba');
    await limpiarDatosDeFinca(soloPruebas);
    console.log(
      soloPruebas
        ? 'Datos de prueba eliminados; datos demo conservados.'
        : 'Datos de prueba y demo eliminados.',
    );
  } catch (error) {
    console.error('No se pudieron limpiar los datos de prueba:', error);
    process.exitCode = 1;
  }
}
