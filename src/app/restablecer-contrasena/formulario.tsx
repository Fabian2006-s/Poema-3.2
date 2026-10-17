'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FormularioRestablecerContrasena({ token }: { token: string }) {
  const router = useRouter();
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);

  async function restablecer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setProcesando(true);
    try {
      const respuesta = await fetch('/api/auth/restablecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contrasena, confirmacion }),
      });
      const resultado = (await respuesta.json()) as { error?: string };
      if (!respuesta.ok) {
        setError(resultado.error ?? 'No se pudo cambiar la contraseña.');
        return;
      }
      router.replace('/login?restablecida=1');
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={restablecer}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="contrasena">
          Nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
          id="contrasena"
          minLength={8}
          onChange={(event) => setContrasena(event.target.value)}
          required
          type="password"
          value={contrasena}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirmacion">
          Confirmar nueva contraseña
        </label>
        <input
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
          id="confirmacion"
          onChange={(event) => setConfirmacion(event.target.value)}
          required
          type="password"
          value={confirmacion}
        />
      </div>

      {error && <p className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p>}

      <button
        className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={procesando}
        type="submit"
      >
        {procesando ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
      <Link className="inline-block text-sm text-blue-200 transition hover:text-white" href="/recuperar-contrasena">
        Solicitar otro enlace
      </Link>
    </form>
  );
}