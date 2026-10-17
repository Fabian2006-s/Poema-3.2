import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Redis } from '@upstash/redis';
import { findUserByEmail, updateUserPasswordById } from '@/lib/auth/users';

const claveRedis = 'poema:password-resets:v1';
let clienteRedis: Redis | undefined;
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

function obtenerClienteRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    clienteRedis ??= new Redis({ url, token });
    return clienteRedis;
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    throw new Error('El almacenamiento persistente de usuarios no está configurado.');
  }
  return null;
}

function obtenerRutaLocal(): string {
  return process.env.POEMA_PASSWORD_RESETS_FILE ?? path.join(process.cwd(), 'data', 'password-resets.json');
}

async function leerColeccion(): Promise<ColeccionRestablecimientos> {
  const redis = obtenerClienteRedis();
  if (redis) {
    const coleccion = await redis.get<ColeccionRestablecimientos>(claveRedis);
    return coleccion
      ? {
          ...coleccion,
          solicitudes: coleccion.solicitudes ?? coleccion.registros.map(({ usuarioId, creadoEn }) => ({ usuarioId, creadoEn })),
        }
      : { registros: [], solicitudes: [] };
  }

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
  const redis = obtenerClienteRedis();
  if (redis) {
    await redis.set(claveRedis, coleccion);
    return;
  }

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
  const limite = Date.now() - 15 * 60 * 1000;
  const redis = obtenerClienteRedis();
  if (redis) {
    return redis.zcount(`poema:password-reset:requests:${usuarioId}`, limite, '+inf');
  }

  const coleccion = await leerColeccion();
  return (coleccion.solicitudes ?? []).filter(
    (solicitud) => solicitud.usuarioId === usuarioId && Date.parse(solicitud.creadoEn) > limite,
  ).length;
}

export async function registrarSolicitudSiPermitida(usuarioId: string): Promise<boolean> {
  const ahora = Date.now();
  const redis = obtenerClienteRedis();
  if (redis) {
    const resultado = await redis.eval<[string, string, string]>(
      "local key=KEYS[1]; local now=tonumber(ARGV[1]); local cutoff=tonumber(ARGV[2]); local member=ARGV[3]; redis.call('ZREMRANGEBYSCORE',key,'-inf',cutoff); local count=redis.call('ZCARD',key); if count>=3 then return {0} end; redis.call('ZADD',key,now,member); redis.call('EXPIRE',key,900); return {1}",
      [`poema:password-reset:requests:${usuarioId}`],
      [String(ahora), String(ahora - 15 * 60 * 1000), randomUUID()],
    );
    return (resultado as number[])[0] === 1;
  }

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
  const coleccion = await leerColeccion();
  const registro = coleccion.registros.find((elemento) => elemento.id === id);
  if (!registro || registro.usadoEn !== null || Date.parse(registro.expiraEn) <= Date.now()) return;
  registro.usadoEn = new Date().toISOString();
  await guardarColeccion(coleccion);
  tokensReservadosLocalmente.delete(id);
}

export async function reservarTokenVigente(id: string): Promise<boolean> {
  const redis = obtenerClienteRedis();
  if (redis) {
    const reservado = await redis.set(`poema:password-reset:lock:${id}`, '1', {
      nx: true,
      ex: 30 * 60,
    });
    if (reservado !== 'OK') return false;

    const coleccion = await leerColeccion();
    const registro = coleccion.registros.find((elemento) => elemento.id === id);
    if (!registro || registro.usadoEn !== null || Date.parse(registro.expiraEn) <= Date.now()) {
      await redis.del(`poema:password-reset:lock:${id}`);
      return false;
    }
    return true;
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
  const redis = obtenerClienteRedis();
  if (redis) {
    await redis.del(`poema:password-reset:lock:${id}`);
    return;
  }
  tokensReservadosLocalmente.delete(id);
}

export async function cambiarContrasenaUsuario(usuarioId: string, password: string): Promise<boolean> {
  return updateUserPasswordById(usuarioId, password);
}