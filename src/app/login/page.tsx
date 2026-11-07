import { Suspense } from 'react';
import { FormularioLogin } from '@/components/auth/FormularioLogin';
import { registroPublicoHabilitado } from '@/lib/auth/registro';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <FormularioLogin mostrarRegistro={registroPublicoHabilitado()} />
    </Suspense>
  );
}
