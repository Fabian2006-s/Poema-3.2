import Link from 'next/link';
import FormularioRestablecerContrasena from './formulario';

export default async function PaginaRestablecerContrasena({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const parametros = await searchParams;
  const token = Array.isArray(parametros.token) ? parametros.token[0] : parametros.token;
  const tokenValido = token && /^[a-f\d]{64}$/i.test(token);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(59,130,246,0.32), transparent 23%), radial-gradient(circle at 82% 72%, rgba(168,85,247,0.25), transparent 27%)',
        }}
      />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">Poema 3.2</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Restablecer contraseña</h1>
        {tokenValido ? (
          <FormularioRestablecerContrasena token={token} />
        ) : (
          <>
            <p className="mt-5 text-sm text-rose-200">El enlace no es válido o ya venció.</p>
            <Link className="mt-6 inline-block text-sm text-blue-200 transition hover:text-white" href="/recuperar-contrasena">
              Solicitar un enlace nuevo
            </Link>
          </>
        )}
      </section>
    </main>
  );
}