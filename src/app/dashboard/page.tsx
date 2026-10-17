import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAuthenticatedEmail } from '@/lib/auth/session';

export default async function DashboardPage() {
  const email = await getAuthenticatedEmail();
  if (!email) redirect('/login');

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <Link
        className="absolute right-4 top-4 z-20 inline-flex items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:right-8 sm:top-8"
        href="/dashboard/password"
      >
        Cambiar contraseña
      </Link>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 22%, rgba(59,130,246,0.32), transparent 23%), radial-gradient(circle at 82% 72%, rgba(168,85,247,0.25), transparent 27%)',
        }}
      />

      <section className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-950/55 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
        <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">
          Poema 3.2
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Panel de la finca
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
          Tu espacio de trabajo está listo. Aquí podrás organizar la información y mantener un margen con la finca.
        </p>
        <p className="mt-4 text-sm text-slate-400">Sesión iniciada como {email}</p>
      </section>
    </main>
  );
}
