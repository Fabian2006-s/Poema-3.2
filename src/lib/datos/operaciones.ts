import type { QueryResultRow } from 'pg';
import { aCentesimas } from '@/lib/reglas/cantidades';
import { conTransaccion, consultar } from '@/lib/db/conexion';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { validarLecturaNoRegresiva } from '@/lib/reglas/maquinaria';
import { siguienteExistenciaMaterial } from '@/lib/reglas/materiales';
import type { DatosEstadoRecurso, DatosOperacion } from '@/lib/validacion/esquemas';

export type ModuloGestion =
  | 'parcelas'
  | 'produccion'
  | 'riego'
  | 'asistencia'
  | 'maquinaria'
  | 'registro-maquinaria'
  | 'empaque'
  | 'ventas'
  | 'gastos'
  | 'materiales'
  | 'movimientos-materiales';

export type FilaGestion = {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string | null;
  indicador: string | null;
  estadoRecurso?: { tipo: 'parcela' | 'maquinaria' | 'material'; activo: boolean };
};

export type OpcionGestion = { id: string; nombre: string };

export type DatosModuloGestion = {
  filas: FilaGestion[];
  parcelas: OpcionGestion[];
  trabajadores: OpcionGestion[];
  maquinaria: OpcionGestion[];
  materiales: OpcionGestion[];
};

type FilaParcela = QueryResultRow & {
  id: string;
  nombre: string;
  area_ha: string | number | null;
  activa: boolean;
};

function registro(
  id: string,
  titulo: string,
  detalle: string,
  fecha: string | null = null,
  indicador: string | null = null,
  estadoRecurso?: FilaGestion['estadoRecurso'],
): FilaGestion {
  return { id, titulo, detalle, fecha, indicador, ...(estadoRecurso ? { estadoRecurso } : {}) };
}

async function opcionesParcelas(): Promise<OpcionGestion[]> {
  return consultar<OpcionGestion & QueryResultRow>(
    'SELECT id, nombre FROM parcelas WHERE activa = true ORDER BY nombre LIMIT 500',
  );
}

async function opcionesTrabajadores(): Promise<OpcionGestion[]> {
  return consultar<OpcionGestion & QueryResultRow>(
    "SELECT id, nombre FROM trabajadores WHERE estado = 'activo' ORDER BY nombre LIMIT 500",
  );
}

async function opcionesMaquinaria(): Promise<OpcionGestion[]> {
  return consultar<OpcionGestion & QueryResultRow>(
    'SELECT id, nombre FROM maquinaria WHERE activa = true ORDER BY nombre LIMIT 500',
  );
}

async function opcionesMateriales(): Promise<OpcionGestion[]> {
  return consultar<OpcionGestion & QueryResultRow>(
    'SELECT id, nombre FROM materiales_empaque WHERE activo = true ORDER BY nombre LIMIT 500',
  );
}

async function listarParcelas(): Promise<FilaGestion[]> {
  const filas = await consultar<FilaParcela>(
    `SELECT id, nombre, area_ha, activa FROM parcelas
      ORDER BY activa DESC, nombre LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.nombre,
      fila.area_ha === null ? 'Área no especificada' : `${Number(fila.area_ha)} ha`,
      null,
      fila.activa ? 'Activa' : 'Inactiva',
      { tipo: 'parcela', activo: fila.activa },
    ),
  );
}

async function listarProduccion(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      parcela: string;
      racimos: number;
      cajas: number;
      observacion: string | null;
    }
  >(
    `SELECT p.id, p.fecha, pa.nombre AS parcela, p.racimos, p.cajas, p.observacion
       FROM producciones p JOIN parcelas pa ON pa.id = p.parcela_id
      ORDER BY p.fecha DESC, p.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.parcela,
      `${fila.racimos} racimos · ${fila.cajas} cajas${fila.observacion ? ` · ${fila.observacion}` : ''}`,
      fila.fecha,
    ),
  );
}

async function listarRiegos(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      parcela: string;
      metodo: string;
      duracion_minutos: number;
      volumen_m3_cent: number;
      observacion: string | null;
    }
  >(
    `SELECT r.id, r.fecha, p.nombre AS parcela, r.metodo, r.duracion_minutos,
            r.volumen_m3_cent, r.observacion
       FROM riegos r JOIN parcelas p ON p.id = r.parcela_id
      ORDER BY r.fecha DESC, r.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.parcela,
      `${fila.metodo} · ${fila.duracion_minutos} min · ${fila.volumen_m3_cent / 100} m³${fila.observacion ? ` · ${fila.observacion}` : ''}`,
      fila.fecha,
    ),
  );
}

async function listarAsistencia(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      trabajador: string;
      estado: string;
      minutos_trabajados: number;
      observacion: string | null;
    }
  >(
    `SELECT a.id, a.fecha, t.nombre AS trabajador, a.estado, a.minutos_trabajados, a.observacion
       FROM asistencias a JOIN trabajadores t ON t.id = a.trabajador_id
      ORDER BY a.fecha DESC, t.nombre LIMIT 500`,
  );
  const estados: Record<string, string> = {
    asistio: 'Asistió',
    falta: 'Falta',
    permiso: 'Permiso',
    incapacidad: 'Incapacidad',
  };
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.trabajador,
      `${estados[fila.estado] ?? fila.estado}${fila.estado === 'asistio' ? ` · ${fila.minutos_trabajados} min` : ''}${fila.observacion ? ` · ${fila.observacion}` : ''}`,
      fila.fecha,
    ),
  );
}

async function listarMaquinaria(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      nombre: string;
      tipo: string;
      identificador: string | null;
      unidad_medidor: string;
      activa: boolean;
    }
  >(
    `SELECT id, nombre, tipo, identificador, unidad_medidor, activa
       FROM maquinaria ORDER BY activa DESC, nombre LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.nombre,
      `${fila.tipo}${fila.identificador ? ` · ${fila.identificador}` : ''} · Medidor en ${fila.unidad_medidor}`,
      null,
      fila.activa ? 'Activa' : 'Inactiva',
      { tipo: 'maquinaria', activo: fila.activa },
    ),
  );
}

async function listarRegistrosMaquinaria(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      nombre: string;
      fecha: string;
      tipo: 'uso' | 'mantenimiento';
      unidad_medidor: string;
      lectura_cent: number | null;
      proxima_lectura_cent: number | null;
      costo_cop: number;
      detalle: string;
    }
  >(
    `SELECT r.id, m.nombre, r.fecha, r.tipo, m.unidad_medidor, r.lectura_cent,
            r.proxima_lectura_cent, r.costo_cop, r.detalle
       FROM registros_maquinaria r JOIN maquinaria m ON m.id = r.maquinaria_id
      ORDER BY r.fecha DESC, r.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.nombre,
      `${fila.tipo === 'uso' ? 'Uso' : 'Mantenimiento'} · ${fila.detalle}`,
      fila.fecha,
      fila.lectura_cent === null
        ? fila.costo_cop > 0
          ? `$${fila.costo_cop.toLocaleString('es-CO')} COP`
          : null
        : [
            `${fila.lectura_cent / 100} ${fila.unidad_medidor}`,
            fila.proxima_lectura_cent === null
              ? null
              : `Servicio en ${fila.proxima_lectura_cent / 100} ${fila.unidad_medidor}`,
            fila.costo_cop > 0 ? `$${fila.costo_cop.toLocaleString('es-CO')} COP` : null,
          ]
            .filter(Boolean)
            .join(' · '),
    ),
  );
}

async function listarEmpaques(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      parcela: string;
      cajas: number;
      rechazos: number;
      observacion: string | null;
    }
  >(
    `SELECT e.id, e.fecha, p.nombre AS parcela, e.cajas, e.rechazos, e.observacion
       FROM empaques e JOIN parcelas p ON p.id = e.parcela_id
      ORDER BY e.fecha DESC, e.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.parcela,
      `${fila.cajas} cajas empacadas · ${fila.rechazos} rechazadas${fila.observacion ? ` · ${fila.observacion}` : ''}`,
      fila.fecha,
    ),
  );
}

async function listarVentas(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      parcela: string;
      cliente: string;
      cajas: number;
      valor_cop: number;
      remision: string | null;
    }
  >(
    `SELECT v.id, v.fecha, p.nombre AS parcela, v.cliente, v.cajas, v.valor_cop, v.remision
       FROM ventas v JOIN parcelas p ON p.id = v.parcela_id
      ORDER BY v.fecha DESC, v.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      `${fila.cliente} · ${fila.parcela}`,
      `${fila.cajas} cajas${fila.remision ? ` · Remisión ${fila.remision}` : ''}`,
      fila.fecha,
      `$${fila.valor_cop.toLocaleString('es-CO')} COP`,
    ),
  );
}

async function listarGastos(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      categoria: string;
      descripcion: string;
      valor_cop: number;
      forma_pago: string | null;
    }
  >(
    `SELECT id, fecha, categoria, descripcion, valor_cop, forma_pago
       FROM gastos ORDER BY fecha DESC, created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.categoria,
      `${fila.descripcion}${fila.forma_pago ? ` · ${fila.forma_pago}` : ''}`,
      fila.fecha,
      `$${fila.valor_cop.toLocaleString('es-CO')} COP`,
    ),
  );
}

async function listarMateriales(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      nombre: string;
      unidad: string;
      disponible: number;
      minima: number;
      activo: boolean;
    }
  >(
    `SELECT id, nombre, unidad, disponible, minima, activo
       FROM materiales_empaque ORDER BY activo DESC, nombre LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.nombre,
      `${fila.disponible} ${fila.unidad} disponibles · Mínimo ${fila.minima}`,
      null,
      !fila.activo ? 'Inactivo' : fila.disponible <= fila.minima ? 'Inventario bajo' : 'Disponible',
      { tipo: 'material', activo: fila.activo },
    ),
  );
}

async function listarMovimientosMateriales(): Promise<FilaGestion[]> {
  const filas = await consultar<
    QueryResultRow & {
      id: string;
      fecha: string;
      nombre: string;
      unidad: string;
      tipo: 'entrada' | 'salida';
      cantidad: number;
      motivo: string;
    }
  >(
    `SELECT mm.id, mm.fecha, m.nombre, m.unidad, mm.tipo, mm.cantidad, mm.motivo
       FROM movimientos_materiales mm JOIN materiales_empaque m ON m.id = mm.material_id
      ORDER BY mm.fecha DESC, mm.created_at DESC LIMIT 500`,
  );
  return filas.map((fila) =>
    registro(
      fila.id,
      fila.nombre,
      `${fila.tipo === 'entrada' ? 'Entrada' : 'Salida'} de ${fila.cantidad} ${fila.unidad} · ${fila.motivo}`,
      fila.fecha,
    ),
  );
}

export async function cargarModuloGestion(modulo: ModuloGestion): Promise<DatosModuloGestion> {
  const datos: DatosModuloGestion = {
    filas: [],
    parcelas: [],
    trabajadores: [],
    maquinaria: [],
    materiales: [],
  };

  switch (modulo) {
    case 'parcelas':
      datos.filas = await listarParcelas();
      break;
    case 'produccion':
      [datos.filas, datos.parcelas] = await Promise.all([listarProduccion(), opcionesParcelas()]);
      break;
    case 'riego':
      [datos.filas, datos.parcelas] = await Promise.all([listarRiegos(), opcionesParcelas()]);
      break;
    case 'asistencia':
      [datos.filas, datos.trabajadores] = await Promise.all([listarAsistencia(), opcionesTrabajadores()]);
      break;
    case 'maquinaria':
      datos.filas = await listarMaquinaria();
      break;
    case 'registro-maquinaria':
      [datos.filas, datos.maquinaria] = await Promise.all([
        listarRegistrosMaquinaria(),
        opcionesMaquinaria(),
      ]);
      break;
    case 'empaque':
      [datos.filas, datos.parcelas] = await Promise.all([listarEmpaques(), opcionesParcelas()]);
      break;
    case 'ventas':
      [datos.filas, datos.parcelas] = await Promise.all([listarVentas(), opcionesParcelas()]);
      break;
    case 'gastos':
      datos.filas = await listarGastos();
      break;
    case 'materiales':
      datos.filas = await listarMateriales();
      break;
    case 'movimientos-materiales':
      [datos.filas, datos.materiales] = await Promise.all([
        listarMovimientosMateriales(),
        opcionesMateriales(),
      ]);
      break;
  }
  return datos;
}

async function exigirParcelaActiva(id: string): Promise<void> {
  const filas = await consultar<QueryResultRow & { id: string }>(
    'SELECT id FROM parcelas WHERE id = $1 AND activa = true',
    [id],
  );
  if (!filas[0]) throw new ErrorDeNegocio('RECURSO_NO_ENCONTRADO');
}

async function exigirTrabajadorActivo(id: string): Promise<void> {
  const filas = await consultar<QueryResultRow & { id: string }>(
    "SELECT id FROM trabajadores WHERE id = $1 AND estado = 'activo'",
    [id],
  );
  if (!filas[0]) throw new ErrorDeNegocio('TRABAJADOR_NO_ENCONTRADO');
}

async function crearParcela(datos: Extract<DatosOperacion, { tipo: 'crear_parcela' }>) {
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO parcelas (nombre, area_ha) VALUES ($1, $2) RETURNING id`,
    [datos.nombre.trim(), datos.areaHa ?? null],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió la parcela creada.');
  return { id: filas[0].id };
}

async function registrarProduccion(
  datos: Extract<DatosOperacion, { tipo: 'registrar_produccion' }>,
) {
  await exigirParcelaActiva(datos.parcelaId);
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO producciones (parcela_id, fecha, racimos, cajas, observacion)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [datos.parcelaId, datos.fecha, datos.racimos, datos.cajas, datos.observacion?.trim() || null],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió la producción creada.');
  return { id: filas[0].id };
}

async function registrarRiego(datos: Extract<DatosOperacion, { tipo: 'registrar_riego' }>) {
  await exigirParcelaActiva(datos.parcelaId);
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO riegos (parcela_id, fecha, metodo, duracion_minutos, volumen_m3_cent, observacion)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      datos.parcelaId,
      datos.fecha,
      datos.metodo.trim(),
      datos.duracionMinutos,
      aCentesimas(datos.volumenM3),
      datos.observacion?.trim() || null,
    ],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió el riego creado.');
  return { id: filas[0].id };
}

async function registrarAsistencia(
  datos: Extract<DatosOperacion, { tipo: 'registrar_asistencia' }>,
) {
  await exigirTrabajadorActivo(datos.trabajadorId);
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO asistencias (trabajador_id, fecha, estado, minutos_trabajados, observacion)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (trabajador_id, fecha) DO UPDATE
       SET estado = EXCLUDED.estado,
           minutos_trabajados = EXCLUDED.minutos_trabajados,
           observacion = EXCLUDED.observacion
     RETURNING id`,
    [
      datos.trabajadorId,
      datos.fecha,
      datos.estado,
      datos.minutosTrabajados,
      datos.observacion?.trim() || null,
    ],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió la asistencia registrada.');
  return { id: filas[0].id };
}

async function crearMaquinaria(datos: Extract<DatosOperacion, { tipo: 'crear_maquinaria' }>) {
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO maquinaria (nombre, tipo, identificador, unidad_medidor)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      datos.nombre.trim(),
      datos.categoria.trim(),
      datos.identificador?.trim() || null,
      datos.unidadMedidor,
    ],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió la maquinaria creada.');
  return { id: filas[0].id };
}

async function registrarMaquinaria(
  datos: Extract<DatosOperacion, { tipo: 'registrar_maquinaria' }>,
) {
  return conTransaccion(async (tx) => {
    const equipo = await tx.query<QueryResultRow & { id: string }>(
      'SELECT id FROM maquinaria WHERE id = $1 AND activa = true FOR UPDATE',
      [datos.maquinariaId],
    );
    if (!equipo.rows[0]) throw new ErrorDeNegocio('RECURSO_NO_ENCONTRADO');

    const lecturaCent =
      datos.lectura === undefined ? null : aCentesimas(datos.lectura);
    if (lecturaCent !== null) {
      const ultima = await tx.query<QueryResultRow & { lectura_cent: number | null }>(
        `SELECT MAX(lectura_cent) AS lectura_cent
           FROM registros_maquinaria WHERE maquinaria_id = $1`,
        [datos.maquinariaId],
      );
      const lecturaAnterior = ultima.rows[0]?.lectura_cent ?? null;
      validarLecturaNoRegresiva(lecturaCent, lecturaAnterior);
    }

    const filas = await tx.query<QueryResultRow & { id: string }>(
      `INSERT INTO registros_maquinaria
         (maquinaria_id, fecha, tipo, lectura_cent, proxima_lectura_cent, costo_cop, detalle)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        datos.maquinariaId,
        datos.fecha,
        datos.tipoRegistro,
        lecturaCent,
        datos.proximaLectura === undefined ? null : aCentesimas(datos.proximaLectura),
        datos.costoCop,
        datos.detalle.trim(),
      ],
    );
    if (!filas.rows[0]) throw new Error('Postgres no devolvió el registro de maquinaria.');
    return { id: filas.rows[0].id };
  });
}

async function registrarEmpaque(datos: Extract<DatosOperacion, { tipo: 'registrar_empaque' }>) {
  await exigirParcelaActiva(datos.parcelaId);
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO empaques (parcela_id, fecha, cajas, rechazos, observacion)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [datos.parcelaId, datos.fecha, datos.cajas, datos.rechazos, datos.observacion?.trim() || null],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió el empaque creado.');
  return { id: filas[0].id };
}

async function registrarVenta(datos: Extract<DatosOperacion, { tipo: 'registrar_venta' }>) {
  await exigirParcelaActiva(datos.parcelaId);
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO ventas (parcela_id, fecha, cliente, cajas, valor_cop, remision, observacion)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      datos.parcelaId,
      datos.fecha,
      datos.cliente.trim(),
      datos.cajas,
      datos.valorCop,
      datos.remision?.trim() || null,
      datos.observacion?.trim() || null,
    ],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió la venta creada.');
  return { id: filas[0].id };
}

async function registrarGasto(datos: Extract<DatosOperacion, { tipo: 'registrar_gasto' }>) {
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO gastos (fecha, categoria, descripcion, valor_cop, forma_pago)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [
      datos.fecha,
      datos.categoria.trim(),
      datos.descripcion.trim(),
      datos.valorCop,
      datos.formaPago?.trim() || null,
    ],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió el gasto creado.');
  return { id: filas[0].id };
}

async function crearMaterial(datos: Extract<DatosOperacion, { tipo: 'crear_material' }>) {
  const filas = await consultar<QueryResultRow & { id: string }>(
    `INSERT INTO materiales_empaque (nombre, unidad, minima)
     VALUES ($1, $2, $3) RETURNING id`,
    [datos.nombre.trim(), datos.unidad.trim(), datos.minima],
  );
  if (!filas[0]) throw new Error('Postgres no devolvió el material creado.');
  return { id: filas[0].id };
}

async function registrarMovimientoMaterial(
  datos: Extract<DatosOperacion, { tipo: 'registrar_movimiento_material' }>,
) {
  return conTransaccion(async (tx) => {
    const consulta = await tx.query<
      QueryResultRow & { disponible: number; activo: boolean }
    >('SELECT disponible, activo FROM materiales_empaque WHERE id = $1 FOR UPDATE', [
      datos.materialId,
    ]);
    const material = consulta.rows[0];
    if (!material || !material.activo) throw new ErrorDeNegocio('RECURSO_NO_ENCONTRADO');

    const siguiente = siguienteExistenciaMaterial(
      material.disponible,
      datos.tipoMovimiento,
      datos.cantidad,
    );

    await tx.query('UPDATE materiales_empaque SET disponible = $1 WHERE id = $2', [
      siguiente,
      datos.materialId,
    ]);
    const resultado = await tx.query<QueryResultRow & { id: string }>(
      `INSERT INTO movimientos_materiales (material_id, tipo, cantidad, motivo, fecha)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        datos.materialId,
        datos.tipoMovimiento,
        datos.cantidad,
        datos.motivo.trim(),
        datos.fecha,
      ],
    );
    if (!resultado.rows[0]) throw new Error('Postgres no devolvió el movimiento de material.');
    return { id: resultado.rows[0].id };
  });
}

export async function registrarOperacion(datos: DatosOperacion): Promise<{ id: string }> {
  switch (datos.tipo) {
    case 'crear_parcela':
      return crearParcela(datos);
    case 'registrar_produccion':
      return registrarProduccion(datos);
    case 'registrar_riego':
      return registrarRiego(datos);
    case 'registrar_asistencia':
      return registrarAsistencia(datos);
    case 'crear_maquinaria':
      return crearMaquinaria(datos);
    case 'registrar_maquinaria':
      return registrarMaquinaria(datos);
    case 'registrar_empaque':
      return registrarEmpaque(datos);
    case 'registrar_venta':
      return registrarVenta(datos);
    case 'registrar_gasto':
      return registrarGasto(datos);
    case 'crear_material':
      return crearMaterial(datos);
    case 'registrar_movimiento_material':
      return registrarMovimientoMaterial(datos);
  }
}

export async function cambiarEstadoRecurso(datos: DatosEstadoRecurso): Promise<void> {
  let tabla: 'parcelas' | 'maquinaria' | 'materiales_empaque';
  let columna: 'activa' | 'activa' | 'activo';
  switch (datos.tipo) {
    case 'estado_parcela':
      tabla = 'parcelas';
      columna = 'activa';
      break;
    case 'estado_maquinaria':
      tabla = 'maquinaria';
      columna = 'activa';
      break;
    case 'estado_material':
      tabla = 'materiales_empaque';
      columna = 'activo';
      break;
  }
  const filas = await consultar<QueryResultRow & { id: string }>(
    `UPDATE ${tabla} SET ${columna} = $1 WHERE id = $2 AND ${columna} <> $1 RETURNING id`,
    [datos.activo, datos.id],
  );
  if (!filas[0]) throw new ErrorDeNegocio('RECURSO_NO_ENCONTRADO');
}
