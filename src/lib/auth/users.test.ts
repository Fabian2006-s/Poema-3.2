import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ErrorDeNegocio } from '@/lib/reglas/errores';
import { createUser, findUserByEmail, updateUserPassword, verifyPassword } from './users';

const originalUsersFile = process.env.POEMA_USERS_FILE;
let temporaryDirectory: string | undefined;

afterEach(async () => {
  if (originalUsersFile === undefined) {
    delete process.env.POEMA_USERS_FILE;
  } else {
    process.env.POEMA_USERS_FILE = originalUsersFile;
  }
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
  temporaryDirectory = undefined;
});

describe('persistencia de contraseña', () => {
  it('crea un usuario con correo normalizado y contraseña almacenada como hash', async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'poema-users-'));
    process.env.POEMA_USERS_FILE = path.join(temporaryDirectory, 'users.json');

    const creado = await createUser(' Nueva.Persona@Example.com ', 'clave-segura-123');
    const guardado = await findUserByEmail('nueva.persona@example.com');

    expect(creado.email).toBe('nueva.persona@example.com');
    expect(creado).not.toHaveProperty('passwordHash');
    expect(guardado).toBeDefined();
    expect(guardado!.passwordHash).not.toBe('clave-segura-123');
    expect(await verifyPassword('clave-segura-123', guardado!.passwordHash)).toBe(true);
  });

  it('rechaza correos que ya están registrados', async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'poema-users-'));
    process.env.POEMA_USERS_FILE = path.join(temporaryDirectory, 'users.json');

    await expect(createUser('demo@poema.com', 'clave-segura-123')).rejects.toMatchObject({
      codigo: 'CORREO_DUPLICADO',
    });
  });

  it('rechaza contraseñas menores de ocho caracteres', async () => {
    await expect(createUser('persona@example.com', 'corta')).rejects.toBeInstanceOf(ErrorDeNegocio);
  });

  it('reemplaza la clave anterior por una nueva sin guardar texto plano', async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'poema-users-'));
    process.env.POEMA_USERS_FILE = path.join(temporaryDirectory, 'users.json');

    const user = await findUserByEmail('demo@poema.com');
    expect(user).toBeDefined();
    expect(await verifyPassword('demo1234', user!.passwordHash)).toBe(true);

    await updateUserPassword('demo@poema.com', 'otra-clave-123');
    const updatedUser = await findUserByEmail('demo@poema.com');

    expect(updatedUser).toBeDefined();
    expect(updatedUser!.passwordHash).not.toBe('otra-clave-123');
    expect(await verifyPassword('demo1234', updatedUser!.passwordHash)).toBe(false);
    expect(await verifyPassword('otra-clave-123', updatedUser!.passwordHash)).toBe(true);
  });
});
