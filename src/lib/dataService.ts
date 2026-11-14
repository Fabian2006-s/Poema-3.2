import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { findUserByEmail, updateUserPasswordById } from '@/lib/auth/users';
import {
  buscarTokenVigentePorHashPostgres,
  contarSolicitudesRecientesPostgres,
  crearTokenRestablecimientoPostgres,
  invalidarTokensPendientesPostgres,
  liberarReservaTokenPostgres,
  marcarTokenComoUsadoPostgres,
  registrarSolicitudPostgresSiPermitida,
  reservarTokenVigentePostgres,
} from '@/lib/datos/restablecimientos';

const tokensReservadosLocalmente = new Set<string>();
const intentosLocalmenteEnCurso = new Set<string>();

export type RegistroRestablecimiento = {
  id: string;
  usuarioId: string;
  tokenHash: string;
  expiraEn: string;
  usadoEn: string | null;
  creadoEn: string;
};

type ColeccionRestablecimientos = {
  registros: RegistroRestablecimiento[];
  solicitudes?: { usuarioId: string; creadoEn: string }[];
};

function usarPostgres(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

function obtenerRutaLocal(): string {
  return process.env.POEMA_PASSWORD_RESETS_FILE ?? path.join(process.cwd(), 'data', 'password-resets.json');
}

async function leerColeccion(): Promise<ColeccionRestablecimientos> {
  try {
    const coleccion = JSON.parse(await readFile(obtenerRutaLocal(), 'utf8')) as ColeccionRestablecimientos;
    return {
      ...coleccion,
      solicitudes: coleccion.solicitudes ?? coleccion.registros.map(({ usuarioId, creadoEn }) => ({ usuarioId, creadoEn })),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { registros: [], solicitudes: [] };
    throw error;
  }
}

async function guardarColeccion(coleccion: ColeccionRestablecimientos): Promise<void> {
  const ruta = obtenerRutaLocal();
  await mkdir(path.dirname(ruta), { recursive: true });
  const rutaTemporal = `${ruta}.${randomUUID()}.tmp`;
  await writeFile(rutaTemporal, `${JSON.stringify(coleccion, null, 2)}\n`, 'utf8');
  await rename(rutaTemporal, ruta);
}

export async function buscarUsuarioPorEmail(email: string) {
  return findUserByEmail(email.trim().toLowerCase());
}

export async function contarSolicitudesRecientes(usuarioId: string): Promise<number> {
  if (usarPostgres()) {
    return contarSolicitudesRecientesPostgres(usuarioId);
  }

  const limite = Date.now() - 15 * 60 * 1000;
  const coleccion = await leerColeccion();
  return (coleccion.solicitudes ?? []).filter(
    (solicitud) => solicitud.usuarioId === usuarioId && Date.parse(solicitud.creadoEn) > limite,
  ).length;
}

export async function registrarSolicitudSiPermitida(usuarioId: string): Promise<boolean> {
  if (usarPostgres()) {
    return registrarSolicitudPostgresSiPermitida(usuarioId);
  }

  const ahora = Date.now();
  if (intentosLocalmenteEnCurso.has(usuarioId)) return false;
  intentosLocalmenteEnCurso.add(usuarioId);
  try {
    const coleccion = await leerColeccion();
    const limite = ahora - 15 * 60 * 1000;
    const solicitudesGuardadas = (coleccion.solicitudes ?? []).filter(
      (solicitud) => solicitud.usuarioId === usuarioId && Date.parse(solicitud.creadoEn) > limite,
    );
    if (solicitudesGuardadas.length >= 3) return false;

    coleccion.solicitudes = [...solicitudesGuardadas, { usuarioId, creadoEn: new Date(ahora).toISOString() }];
    await guardarColeccion(coleccion);
    return true;
  } finally {
    intentosLocalmenteEnCurso.delete(usuarioId);
  }
}

export async function invalidarTokensPendientes(usuarioId: string): Promise<void> {
  if (usarPostgres()) {
    return invalidarTokensPendientesPostgres(usuarioId);
  }

  const coleccion = await leerColeccion();
  const ahora = new Date().toISOString();
  let huboCambios = false;
  for (const registro of coleccion.registros) {
    if (registro.usuarioId === usuarioId && registro.usadoEn === null) {
      registro.usadoEn = ahora;
      huboCambios = true;
    }
  }
  if (huboCambios) await guardarColeccion(coleccion);
}

export async function crearTokenRestablecimiento(
  usuarioId: string,
  tokenHash: string,
  expiraEn: Date,
): Promise<void> {
  if (usarPostgres()) {
    return crearTokenRestablecimientoPostgres(usuarioId, tokenHash, expiraEn);
  }

  const coleccion = await leerColeccion();
  coleccion.registros.push({
    id: randomUUID(),
    usuarioId,
    tokenHash,
    expiraEn: expiraEn.toISOString(),
    usadoEn: null,
    creadoEn: new Date().toISOString(),
  });
  await guardarColeccion(coleccion);
}

export async function buscarTokenVigentePorHash(
  tokenHash: string,
): Promise<RegistroRestablecimiento | undefined> {
  if (usarPostgres()) {
    return buscarTokenVigentePorHashPostgres(tokenHash);
  }

  const ahora = Date.now();
  const coleccion = await leerColeccion();
  return coleccion.registros.find(
    (registro) =>
      registro.tokenHash === tokenHash &&
      registro.usadoEn === null &&
      Date.parse(registro.expiraEn) > ahora,
  );
}

export async function marcarTokenComoUsado(id: string): Promise<void> {
  if (usarPostgres()) {
    return marcarTokenComoUsadoPostgres(id);
  }

  const coleccion = await leerColeccion();
  const registro = coleccion.registros.find((elemento) => elemento.id === id);
  if (!registro || registro.usadoEn !== null || Date.parse(registro.expiraEn) <= Date.now()) return;
  registro.usadoEn = new Date().toISOString();
  await guardarColeccion(coleccion);
  tokensReservadosLocalmente.delete(id);
}

export async function reservarTokenVigente(id: string): Promise<boolean> {
  if (usarPostgres()) {
    return reservarTokenVigentePostgres(id);
  }

  if (tokensReservadosLocalmente.has(id)) return false;
  tokensReservadosLocalmente.add(id);
  const coleccion = await leerColeccion();
  const registro = coleccion.registros.find((elemento) => elemento.id === id);
  if (!registro || registro.usadoEn !== null || Date.parse(registro.expiraEn) <= Date.now()) {
    tokensReservadosLocalmente.delete(id);
    return false;
  }
  return true;
}

export async function liberarReservaToken(id: string): Promise<void> {
  if (usarPostgres()) {
    return liberarReservaTokenPostgres(id);
  }
  tokensReservadosLocalmente.delete(id);
}

export async function cambiarContrasenaUsuario(usuarioId: string, password: string): Promise<boolean> {
  return updateUserPasswordById(usuarioId, password);
}

export { listarAlertas } from '@/lib/datos/alertas';
export {
  asignarImplemento,
  implementosDeTrabajador,
  listarAsignaciones,
  registrarDevolucion,
} from '@/lib/datos/asignaciones';
export { crearImplemento, actualizarImplemento, listarImplementos } from '@/lib/datos/implementos';
export { listarMovimientos, registrarMovimiento } from '@/lib/datos/movimientos';
export { crearQuimico, actualizarQuimico, listarQuimicos } from '@/lib/datos/quimicos';
export {
  actualizarTrabajador,
  buscarTrabajadorPorId,
  crearTrabajador,
  listarTrabajadores,
} from '@/lib/datos/trabajadores';
export { cerrarPool } from '@/lib/datos/conexion';
export type {
  Asignacion,
  AsignacionDetalle,
  DatosMovimiento,
  ElementoAlerta,
  Implemento,
  ImplementoAsignado,
  Movimiento,
  Quimico,
  ResultadoMovimiento,
  Trabajador,
} from '@/lib/datos/tipos';