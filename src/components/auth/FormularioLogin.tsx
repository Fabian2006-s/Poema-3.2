'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type FormErrors = {
  email?: string;
  password?: string;
};

export function FormularioLogin({ mostrarRegistro }: { mostrarRegistro: boolean }) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contrasenaRestablecida = parametros.get('restablecida') === '1';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Escribe un correo válido.';
    }
    if (!password.trim()) {
      nextErrors.password = 'La contraseña es obligatoria.';
    }

    setErrors(nextErrors);
    setAuthError('');
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };

      if (response.ok) {
        router.replace('/finca');
        router.refresh();
        return;
      }

      setAuthError(result.error ?? 'No se pudo iniciar sesión.');
    } catch {
      setAuthError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f1f3e9] px-4 py-8 sm:px-6 lg:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(167,190,130,0.22), transparent 27%), radial-gradient(circle at 88% 82%, rgba(216,188,121,0.18), transparent 25%)',
        }}
      />

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_32px_100px_-40px_rgba(28,57,38,0.35)] lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative isolate flex min-h-[350px] flex-col justify-between overflow-hidden bg-[#193f2e] p-7 text-white sm:p-10 lg:min-h-[680px] lg:p-14">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(circle at 82% 18%, rgba(187,207,129,0.24), transparent 28%), linear-gradient(145deg, #1d4b35, #123626 78%)',
            }}
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-16 -z-10 h-[420px] w-[420px] text-[#d3df9e] opacity-[0.13] sm:-right-8"
            fill="none"
            viewBox="0 0 420 420"
          >
            <path
              d="M340 35C207 57 99 155 79 298c81 27 182 3 231-74 35-55 43-126 30-189Z"
              fill="currentColor"
            />
            <path d="M91 301C154 220 227 144 331 56" stroke="#193f2e" strokeWidth="5" />
            <path
              d="M176 214c-6-52-28-82-70-106m145 31c-5-45-21-76-54-101m-67 214c-46-4-78 7-111 34m174-95c-48-7-84 1-119 29"
              stroke="#193f2e"
              strokeWidth="4"
            />
          </svg>

          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#dce9b4]">
              <svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 32 32">
                <path
                  d="M25.5 4.5C15.2 6.1 7.6 13.3 7 23.8c6.3 2.1 13.7.3 17.1-5.3 2.4-3.9 2.7-9.1 1.4-14Z"
                  fill="currentColor"
                />
                <path d="M8 24c4.8-6.1 9.5-10.7 16-16" stroke="#193f2e" strokeWidth="1.6" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-white/65 uppercase">
                Poema 3.2
              </p>
              <p className="mt-0.5 text-sm font-semibold">Finca Bananera</p>
            </div>
          </div>

          <div className="relative max-w-lg py-10 lg:py-16">
            <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[#dce9b4] uppercase">
              Gestión hecha para el campo
            </p>
            <h1 className="text-4xl leading-[1.08] font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Cada detalle de la finca, en su lugar.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/75">
              Personal, inventario y movimientos reunidos en un solo espacio para que el trabajo
              diario fluya con claridad.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-medium text-white/80">
            {['Personal', 'Existencias', 'Trazabilidad'].map((etiqueta) => (
              <span
                className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-2"
                key={etiqueta}
              >
                {etiqueta}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-7 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <p className="text-xs font-bold tracking-[0.18em] text-primario uppercase">
              Acceso del encargado
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-texto sm:text-4xl">
              Inicia sesión
            </h2>
            <p className="mt-3 text-sm leading-6 text-texto-suave">
              Ingresa con el correo y la contraseña de tu cuenta autorizada.
            </p>
            {contrasenaRestablecida && (
              <p
                className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                role="status"
              >
                Contraseña restablecida. Ya puedes iniciar sesión.
              </p>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="mb-2 block text-sm font-semibold text-texto" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={Boolean(errors.email)}
                  autoComplete="email"
                  className="w-full rounded-xl border border-borde bg-[#f8f9f5] px-4 py-3.5 text-texto outline-none transition placeholder:text-slate-400 focus:border-primario focus:ring-4 focus:ring-primario/10"
                  id="email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (errors.email) {
                      setErrors((current) => {
                        const nextErrors = { ...current };
                        delete nextErrors.email;
                        return nextErrors;
                      });
                    }
                  }}
                  placeholder="tu@correo.com"
                  type="email"
                  value={email}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-rose-700" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-texto" htmlFor="password">
                  Contraseña
                </label>
                <input
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={Boolean(errors.password)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-borde bg-[#f8f9f5] px-4 py-3.5 text-texto outline-none transition placeholder:text-slate-400 focus:border-primario focus:ring-4 focus:ring-primario/10"
                  id="password"
                  name="password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) {
                      setErrors((current) => {
                        const nextErrors = { ...current };
                        delete nextErrors.password;
                        return nextErrors;
                      });
                    }
                  }}
                  placeholder="Tu contraseña"
                  type="password"
                  value={password}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-rose-700" id="password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              {authError && (
                <p
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                  role="alert"
                >
                  {authError}
                </p>
              )}

              <button
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primario px-4 py-3.5 font-semibold text-white shadow-lg shadow-[#286044]/20 transition hover:-translate-y-0.5 hover:bg-[#204f38] focus:outline-none focus:ring-4 focus:ring-primario/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar a mi finca'}
                {!isSubmitting && (
                  <svg
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M3 8h10m-4-4 4 4-4 4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.6"
                    />
                  </svg>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-5">
                <Link
                  className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
                  href="/recuperar-contrasena"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
                {mostrarRegistro && (
                  <Link
                    className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
                    href="/registro"
                  >
                    Crear una cuenta
                  </Link>
                )}
              </div>
            </form>
            <p className="mt-8 text-center text-xs leading-5 text-texto-suave">
              Tu espacio de trabajo para cuidar cada detalle de la finca.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
