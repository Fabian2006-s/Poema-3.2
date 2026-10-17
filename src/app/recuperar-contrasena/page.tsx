'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function PaginaRecuperarContrasena() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  async function solicitarEnlace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje('');
    setError('');
    setProcesando(true);

    try {
      const respuesta = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const resultado = (await respuesta.json()) as { mensaje?: string; error?: string };
      if (!respuesta.ok) {
        setError(resultado.error ?? 'No se pudo procesar la solicitud.');
        return;
      }
      setMensaje(resultado.mensaje ?? 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.');
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

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
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Recuperar contraseña</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Escribe el correo asociado a tu cuenta y te enviaremos un enlace.</p>

        <form className="mt-8 space-y-5" onSubmit={solicitarEnlace}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
              Correo electrónico
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              required
              type="email"
              value={email}
            />
          </div>

          {error && <p className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p>}
          {mensaje && <p className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200" role="status">{mensaje}</p>}

          <button
            className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={procesando}
            type="submit"
          >
            {procesando ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>

        <Link className="mt-6 inline-block text-sm text-blue-200 transition hover:text-white" href="/login">
          Volver al inicio de sesión
        </Link>
      </section>
    </main>
  );
}