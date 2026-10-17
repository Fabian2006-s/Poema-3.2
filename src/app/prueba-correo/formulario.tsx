'use client';

import { FormEvent, useState } from 'react';

export default function FormularioPruebaCorreo() {
  const [para, setPara] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje('');
    setError('');
    setEnviando(true);

    try {
      const respuesta = await fetch('/api/correo/prueba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ para }),
      });
      const resultado = (await respuesta.json()) as { mensaje?: string; error?: string };
      if (!respuesta.ok) {
        setError(resultado.error ?? 'No se pudo enviar el correo.');
        return;
      }
      setMensaje(resultado.mensaje ?? 'Correo enviado.');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={enviar}>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="para">
          Correo de destino
        </label>
        <input
          autoComplete="email"
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
          id="para"
          onChange={(event) => setPara(event.target.value)}
          placeholder="tu@correo.com"
          required
          type="email"
          value={para}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200" role="status">
          {mensaje}
        </p>
      )}

      <button
        className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={enviando}
        type="submit"
      >
        {enviando ? 'Enviando...' : 'Enviar prueba'}
      </button>
    </form>
  );
}