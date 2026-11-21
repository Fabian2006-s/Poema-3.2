import { hayUsuariosLogin } from '@/lib/datos/usuariosLogin';

export async function mostrarRegistroPublico(): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') return true;
  return !(await hayUsuariosLogin());
}
