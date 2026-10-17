import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
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
  const usersFile = getUsersFile();
  await mkdir(path.dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(collection, null, 2)}\n`, 'utf8');
  await rename(temporaryFile, usersFile);
}

async function loadUsers(): Promise<UserCollection> {
  const usersFile = getUsersFile();
  try {
    return JSON.parse(await readFile(usersFile, 'utf8')) as UserCollection;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;

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
          email: 'demo@poema.com',
          passwordHash: await hashPassword('demo1234'),
          createdAt: now,
          updatedAt: now,
        },
      ],
    };
    await saveUsers(collection);
    return collection;
  }
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