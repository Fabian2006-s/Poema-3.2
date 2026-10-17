import { notFound } from 'next/navigation';
import FormularioPruebaCorreo from './formulario';

export default function PaginaPruebaCorreo() {
  if (process.env.NODE_ENV === 'production') notFound();

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
        <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">
          Poema 3.2
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Prueba de correo</h1>
        <FormularioPruebaCorreo />
      </section>
    </main>
  );
}