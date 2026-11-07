import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { NavegacionFinca } from '@/components/finca/NavegacionFinca';
import { obtenerSesion } from '@/lib/auth/sesion';

export const dynamic = 'force-dynamic';

export default async function FincaLayout({ children }: { children: ReactNode }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect('/login');

  return (
    <div className="min-h-screen bg-fondo text-texto">
      <NavegacionFinca correo={sesion.email} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
