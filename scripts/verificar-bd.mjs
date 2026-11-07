import { crearPool } from './conexion-bd.mjs';

const tablas = ['trabajadores', 'implementos', 'quimicos', 'movimientos', 'asignaciones'];
const vistas = ['v_implementos', 'v_quimicos'];
const estructuras = [
  ['ux_trab_documento', 'índice'],
  ['ux_impl_nombre', 'índice'],
  ['ux_quim_nombre', 'índice'],
  ['impl_disp_no_neg', 'restricción'],
  ['quim_disp_no_neg', 'restricción'],
  ['mov_cantidad_positiva', 'restricción'],
  ['mov_motivo_minimo', 'restricción'],
];
let fallas = 0;
const pool = crearPool();
let cliente;
let transaccionIniciada = false;

function resultado(etiqueta, correcto, detalle = '') {
  console.log(`${correcto ? 'OK' : 'FALLA'} ${etiqueta}${detalle ? `: ${detalle}` : ''}`);
  if (!correcto) fallas += 1;
}

try {
  cliente = await pool.connect();
  await cliente.query('SELECT 1');
  console.log('Conexión a Postgres: OK');

  for (const nombre of [...tablas, ...vistas]) {
    const { rows } = await cliente.query('SELECT to_regclass($1) IS NOT NULL AS existe', [
      `public.${nombre}`,
    ]);
    resultado(`Existe ${nombre}`, rows[0].existe);
  }

  for (const nombre of tablas) {
    const { rows } = await cliente.query(`SELECT COUNT(*)::INTEGER AS cantidad FROM public.${nombre}`);
    console.log(`Filas ${nombre}: ${rows[0].cantidad}`);
  }

  const { rows: objetos } = await cliente.query(
    `SELECT indexname AS nombre, 'índice' AS tipo
       FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = ANY($1::TEXT[])
     UNION ALL
     SELECT c.conname AS nombre, 'restricción' AS tipo
       FROM pg_constraint c
       JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE n.nspname = 'public' AND c.conname = ANY($1::TEXT[])`,
    [estructuras.map(([nombre]) => nombre)],
  );
  const existentes = new Map(objetos.map(({ nombre, tipo }) => [nombre, tipo]));
  for (const [nombre, tipo] of estructuras) {
    resultado(`Existe ${tipo} ${nombre}`, existentes.get(nombre) === tipo);
  }

  for (const nombre of tablas) {
    const { rows } = await cliente.query(
      'SELECT relrowsecurity AS activo FROM pg_class WHERE oid = to_regclass($1)',
      [`public.${nombre}`],
    );
    resultado(`RLS ${nombre}`, rows[0]?.activo === true, rows[0]?.activo === true ? 'activo' : 'inactivo');
  }

  await cliente.query('BEGIN');
  transaccionIniciada = true;

  let creadoTrabajador = false;
  await cliente.query('SAVEPOINT caso_a_crear_trabajador');
  try {
    await cliente.query(
      `INSERT INTO trabajadores (nombre, documento, cargo)
       VALUES ($1, $2, $3)`,
      ['Verif Juan', 'VD-1', 'Verificación'],
    );
    creadoTrabajador = true;
  } catch (error) {
    await cliente.query('ROLLBACK TO SAVEPOINT caso_a_crear_trabajador');
    console.error('No se pudo crear el trabajador de prueba:', error);
  }

  const duplicadoEsperado = await verificarRestriccion(
    cliente,
    'caso_a_documento_unico',
    `INSERT INTO trabajadores (nombre, documento, cargo)
     VALUES ($1, $2, $3)`,
    ['Verif Juan duplicado', 'VD-1', 'Verificación'],
    '23505',
    'ux_trab_documento',
  );
  resultado('a) trabajador y documento VD-1 único', creadoTrabajador && duplicadoEsperado);

  resultado(
    'b) disponible negativo de implemento',
    await verificarRestriccion(
      cliente,
      'caso_b_impl_negativo',
      `INSERT INTO implementos (nombre, categoria, disponible, minima)
       VALUES ($1, $2, $3, $4)`,
      ['Verif Negativo', 'Prueba', -1, 0],
      '23514',
      'impl_disp_no_neg',
    ),
  );

  resultado(
    'c) disponible_cent negativo de químico',
    await verificarRestriccion(
      cliente,
      'caso_c_quim_negativo',
      `INSERT INTO quimicos
         (nombre, categoria, disponible_cent, minima_cent, unidad, fecha_vencimiento)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Verif Químico', 'Prueba', -1, 0, 'litros', '2027-01-01'],
      '23514',
      'quim_disp_no_neg',
    ),
  );

  resultado(
    'd) movimiento con cantidad_cent cero',
    await verificarRestriccion(
      cliente,
      'caso_d_mov_cero',
      `INSERT INTO movimientos
         (tipo_elemento, elemento_id, tipo, cantidad_cent, motivo, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['implemento', '00000000-0000-0000-0000-000000000001', 'entrada', 0, 'Verificación', '2026-01-01'],
      '23514',
      'mov_cantidad_positiva',
    ),
  );

  resultado(
    'e) movimiento con motivo vacío',
    await verificarRestriccion(
      cliente,
      'caso_e_mov_motivo_vacio',
      `INSERT INTO movimientos
         (tipo_elemento, elemento_id, tipo, cantidad_cent, motivo, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['implemento', '00000000-0000-0000-0000-000000000001', 'entrada', 100, ' ', '2026-01-01'],
      '23514',
      'mov_motivo_minimo',
    ),
  );

  resultado(
    "f) movimiento con tipo_elemento 'vehiculo'",
    await verificarRestriccion(
      cliente,
      'caso_f_mov_tipo_invalido',
      `INSERT INTO movimientos
         (tipo_elemento, elemento_id, tipo, cantidad_cent, motivo, fecha)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['vehiculo', '00000000-0000-0000-0000-000000000001', 'entrada', 100, 'Verificación', '2026-01-01'],
      '23514',
      'mov_tipo_elemento_valido',
    ),
  );

  resultado(
    "g) trabajador con estado 'suspendido'",
    await verificarRestriccion(
      cliente,
      'caso_g_estado_invalido',
      `INSERT INTO trabajadores (nombre, documento, cargo, estado)
       VALUES ($1, $2, $3, $4)`,
      ['Verif Suspendido', 'VD-2', 'Verificación', 'suspendido'],
      '23514',
      'trab_estado_valido',
    ),
  );

  await cliente.query('SAVEPOINT caso_h_inventario_bajo');
  let alertaIgualdad = false;
  try {
    await cliente.query(
      `INSERT INTO implementos (nombre, categoria, disponible, minima)
       VALUES ($1, $2, $3, $4)`,
      ['Verif Guantes', 'Prueba', 5, 5],
    );
    const { rows } = await cliente.query(
      'SELECT inventario_bajo FROM v_implementos WHERE nombre = $1',
      ['Verif Guantes'],
    );
    alertaIgualdad = rows[0]?.inventario_bajo === true;
  } catch (error) {
    await cliente.query('ROLLBACK TO SAVEPOINT caso_h_inventario_bajo');
    console.error('No se pudo comprobar la alerta de igualdad:', error);
  }
  resultado('h) inventario 5 con mínima 5 activa alerta de bajo', alertaIgualdad);
} catch (error) {
  console.error('Error durante la verificación de la base de datos:', error);
  fallas += 1;
} finally {
  if (cliente && transaccionIniciada) {
    try {
      await cliente.query('ROLLBACK');
      console.log('Transacción de integridad: ROLLBACK (siempre)');
    } catch (error) {
      console.error('No se pudo revertir la transacción de integridad:', error);
      fallas += 1;
    }
  }
  cliente?.release();
  await pool.end();
}

console.log(`Total de fallas: ${fallas}`);
if (fallas > 0) process.exitCode = 1;

async function verificarRestriccion(clienteBd, savepoint, sql, valores, codigo, restriccion) {
  await clienteBd.query(`SAVEPOINT ${savepoint}`);
  let errorRecibido;
  try {
    await clienteBd.query(sql, valores);
  } catch (error) {
    errorRecibido = error;
  }
  await clienteBd.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  await clienteBd.query(`RELEASE SAVEPOINT ${savepoint}`);
  return errorRecibido?.code === codigo && errorRecibido?.constraint === restriccion;
}
