import Link from 'next/link';
import { FormularioUsuario } from '@/components/finca/FormularioUsuario';
import { registroPublicoHabilitado } from '@/lib/auth/registro';

export const dynamic = 'force-dynamic';

export default function RegistroPage() {
  if (!registroPublicoHabilitado()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-borde bg-superficie p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold text-texto">Registro deshabilitado</h1>
          <p className="mt-3 text-texto-suave">
            Por seguridad, las cuentas nuevas deben ser creadas por una persona autorizada desde el
            panel.
          </p>
          <Link
            className="mt-6 inline-block text-sm font-semibold text-primario underline-offset-4 hover:underline"
            href="/login"
          >
            Volver al inicio de sesión
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-borde bg-superficie p-6 shadow-xl sm:p-8">
        <header className="mb-6">
          <p className="text-sm font-semibold text-primario">Poema 3.2</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Crear cuenta</h1>
          <p className="mt-2 text-texto-suave">
            Regístrate para ingresar y administrar la finca.
          </p>
        </header>
        <FormularioUsuario modoRegistro />
        <Link
          className="mt-5 inline-block text-sm font-semibold text-primario underline-offset-4 hover:underline"
          href="/login"
        >
          Ya tengo una cuenta
        </Link>
      </section>
    </main>
  );
}
