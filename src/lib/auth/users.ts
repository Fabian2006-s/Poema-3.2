import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { Redis } from '@upstash/redis';

const scrypt = promisify(scryptCallback);
const usersKey = 'poema:users:v1';
let redisClient: Redis | undefined;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
}

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    redisClient ??= new Redis({ url, token });
    return redisClient;
  }
  if (isProduction()) {
    throw new Error('Configura UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en Vercel.');
  }
  return null;
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

async function saveUsers(collection: UserCollection): Promise<void> {
  const now = new Date().toISOString();
  collection._meta.lastModified = now;
  const redis = getRedisClient();
  if (redis) {
    await redis.set(usersKey, collection);
    return;
  }

  const usersFile = getUsersFile();
  await mkdir(path.dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(collection, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, usersFile);
}

async function loadUsers(): Promise<UserCollection> {
  const redis = getRedisClient();
  if (redis) {
    const storedCollection = await redis.get<UserCollection>(usersKey);
    if (storedCollection) return storedCollection;
    return initializeUsers(async (collection) => {
      await redis.set(usersKey, collection, { nx: true });
      return (await redis.get<UserCollection>(usersKey)) ?? collection;
    });
  }

  const usersFile = getUsersFile();
  try {
    return JSON.parse(await readFile(usersFile, 'utf8')) as UserCollection;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    return initializeUsers(async (collection) => {
      await saveUsers(collection);
      return collection;
    });
  }
}

async function initializeUsers(
  persist: (collection: UserCollection) => Promise<UserCollection>,
): Promise<UserCollection> {
  const email = process.env.DEMO_USER_EMAIL ?? (isProduction() ? undefined : 'demo@poema.com');
  const password = process.env.DEMO_USER_PASSWORD ?? (isProduction() ? undefined : 'demo1234');
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
  const collection = await loadUsers();
  return collection.records.find((user) => user.email === email.toLowerCase());
}

export async function updateUserPassword(email: string, password: string): Promise<boolean> {
  const collection = await loadUsers();
  const user = collection.records.find((record) => record.email === email.toLowerCase());
  if (!user) return false;

  user.passwordHash = await hashPassword(password);
  user.updatedAt = new Date().toISOString();
  await saveUsers(collection);
  return true;
}

export async function updateUserPasswordById(userId: string, password: string): Promise<boolean> {
  const collection = await loadUsers();
  const user = collection.records.find((record) => record.id === userId);
  if (!user) return false;

  user.passwordHash = await hashPassword(password);
  user.updatedAt = new Date().toISOString();
  await saveUsers(collection);
  return true;
}