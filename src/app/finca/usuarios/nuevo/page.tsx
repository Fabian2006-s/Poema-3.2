import Link from 'next/link';
import { FormularioUsuario } from '@/components/finca/FormularioUsuario';

export const dynamic = 'force-dynamic';

export default function NuevoUsuarioPage() {
  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold text-primario">Acceso a la aplicación</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Crear usuario</h1>
        <p className="mt-2 text-texto-suave">Agrega una cuenta para otra persona autorizada.</p>
      </header>
      <FormularioUsuario />
      <Link
        className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
        href="/finca"
      >
        Volver al panel
      </Link>
    </div>
  );
}
