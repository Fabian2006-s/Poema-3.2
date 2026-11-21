import { Suspense } from 'react';
import { FormularioLogin } from '@/components/auth/FormularioLogin';
import { mostrarRegistroPublico } from '@/lib/auth/registro';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const mostrarRegistro = await mostrarRegistroPublico();

  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <FormularioLogin mostrarRegistro={mostrarRegistro} />
    </Suspense>
  );
}
