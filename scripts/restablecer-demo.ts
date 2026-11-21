import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

async function main(): Promise<void> {
  const { cerrarPool } = await import('@/lib/db/conexion');
  const { createUser, findUserByEmail, updateUserPassword } =
    await import('@/lib/auth/users');

  try {
    const correo = 'demo@poema.com';
    const contrasena = 'demo1234';
    const usuario = await findUserByEmail(correo);

    if (usuario) {
      await updateUserPassword(correo, contrasena);
    } else {
      await createUser(correo, contrasena);
    }

    console.log(`Cuenta demo restablecida: ${correo}`);
  } catch (error) {
    console.error('No se pudo restablecer la cuenta demo:', error);
    process.exitCode = 1;
  } finally {
    await cerrarPool();
  }
}

void main();
