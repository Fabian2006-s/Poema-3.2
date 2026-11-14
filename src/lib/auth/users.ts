import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  actualizarHashUsuarioLoginPorCorreo,
  actualizarHashUsuarioLoginPorId,
  buscarUsuarioLoginPorCorreo,
  crearUsuarioInicialSiVacio,
  guardarUsuarioLogin,
  hayUsuariosLogin,
} from '@/lib/datos/usuariosLogin';
import { ErrorDeNegocio } from '@/lib/reglas/errores';

const scrypt = promisify(scryptCallback);

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

function getUsersFile(): string {
  return process.env.POEMA_USERS_FILE ?? path.join(process.cwd(), 'data', 'users.json');
}

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

type UserCollection = {
  _meta: { version: number; lastModified: string; description: string };
  records: UserRecord[];
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [salt, storedKey] = passwordHash.split(':');
  if (!salt || !storedKey) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const expectedKey = Buffer.from(storedKey, 'hex');
  return expectedKey.length === derivedKey.length && timingSafeEqual(expectedKey, derivedKey);
}

async function saveUsersLocal(collection: UserCollection): Promise<void> {
  const now = new Date().toISOString();
  collection._meta.lastModified = now;
  const usersFile = getUsersFile();
  await mkdir(path.dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(collection, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, usersFile);
}

async function loadUsersLocal(): Promise<UserCollection> {
  const usersFile = getUsersFile();
  try {
    return JSON.parse(await readFile(usersFile, 'utf8')) as UserCollection;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return initializeUsersLocal(async (collection) => {
      await saveUsersLocal(collection);
      return collection;
    });
  }
}

async function initializeUsersLocal(
  persist: (collection: UserCollection) => Promise<UserCollection>,
): Promise<UserCollection> {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@poema.com';
  const password = process.env.DEMO_USER_PASSWORD ?? 'demo1234';
  if (!email || !password) {
    throw new Error('Configura DEMO_USER_EMAIL y DEMO_USER_PASSWORD para crear la cuenta inicial.');
  }

  const now = new Date().toISOString();
  const collection: UserCollection = {
    _meta: {
      version: 1,
      lastModified: now,
      description: 'Usuarios y hashes de contraseñas',
    },
    records: [
      {
        id: 'usr_001',
        email: email.trim().toLowerCase(),
        passwordHash: await hashPassword(password),
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
  return persist(collection);
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const correo = email.trim().toLowerCase();
  if (!isProduction()) {
    const collection = await loadUsersLocal();
    return collection.records.find((user) => user.email === correo);
  }

  const usuario = await buscarUsuarioLoginPorCorreo(correo);
  if (usuario) return usuario;
  if (await hayUsuariosLogin()) return undefined;

  const emailInicial = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
  const contrasenaInicial = process.env.DEMO_USER_PASSWORD;
  const ahora = new Date().toISOString();
  const usuarioInicial =
    emailInicial && contrasenaInicial
      ? {
          id: `usr_${randomUUID()}`,
          email: emailInicial,
          passwordHash: await hashPassword(contrasenaInicial),
          createdAt: ahora,
          updatedAt: ahora,
        }
      : null;
  await crearUsuarioInicialSiVacio(usuarioInicial);
  return buscarUsuarioLoginPorCorreo(correo);
}

export async function createUser(
  email: string,
  password: string,
): Promise<Omit<UserRecord, 'passwordHash'>> {
  const correo = email.trim().toLowerCase();
  if (!correo || password.length < 8 || password.length > 128) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: `usr_${randomUUID()}`,
    email: correo,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };
  if (isProduction()) {
    await guardarUsuarioLogin(user);
  } else {
    const collection = await loadUsersLocal();
    if (collection.records.some((record) => record.email === correo)) {
      throw new ErrorDeNegocio('CORREO_DUPLICADO');
    }
    collection.records.push(user);
    await saveUsersLocal(collection);
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUserPassword(email: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  if (isProduction()) {
    return actualizarHashUsuarioLoginPorCorreo(email, passwordHash);
  }

  const collection = await loadUsersLocal();
  const user = collection.records.find((record) => record.email === email.toLowerCase());
  if (!user) return false;
  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();
  await saveUsersLocal(collection);
  return true;
}

export async function updateUserPasswordById(userId: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  if (isProduction()) {
    return actualizarHashUsuarioLoginPorId(userId, passwordHash);
  }

  const collection = await loadUsersLocal();
  const user = collection.records.find((record) => record.id === userId);
  if (!user) return false;
  user.passwordHash = passwordHash;
  user.updatedAt = new Date().toISOString();
  await saveUsersLocal(collection);
  return true;
}
