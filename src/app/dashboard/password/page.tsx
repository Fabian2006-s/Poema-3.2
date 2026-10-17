'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    fetch('/api/auth/session')
      .then(async (response) => {
        if (!response.ok) {
          router.replace('/login');
          return;
        }
        const result = (await response.json()) as { email: string };
        if (isActive) setEmail(result.email);
      })
      .catch(() => router.replace('/login'))
      .finally(() => {
        if (isActive) setIsCheckingSession(false);
      });

    return () => {
      isActive = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        setError(result.error ?? 'No se pudo cambiar la contraseña.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(result.message ?? 'La contraseña se actualizó correctamente.');
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
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
      <section className="relative z-10 w-full max-w-lg rounded-3xl border border-white/15 bg-slate-950/55 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">
          Poema 3.2
        </p>
        <h1 className="text-3xl font-extrabold text-white">Cambiar contraseña</h1>
        <p className="mt-3 text-sm text-slate-300" aria-live="polite">
          {isCheckingSession ? 'Comprobando sesión...' : email}
        </p>

        {!isCheckingSession && email && (
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="current-password">
                Contraseña actual
              </label>
              <input
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
                id="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
                type="password"
                value={currentPassword}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="new-password">
                Nueva contraseña
              </label>
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
                id="new-password"
                minLength={8}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                type="password"
                value={newPassword}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="confirm-password">
                Confirmar nueva contraseña
              </label>
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
                id="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200" role="status">
                {message}
              </p>
            )}

            <button
              className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
            </button>
          </form>
        )}

        <Link className="mt-6 inline-block text-sm text-blue-200 transition hover:text-white" href="/dashboard">
          Volver al panel
        </Link>
      </section>
    </main>
  );
}