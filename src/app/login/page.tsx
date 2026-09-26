'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const demoEmail = 'demo@poema.com';
const demoPassword = 'demo1234';

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    window.setTimeout(() => {
      // TODO: conectar con la API real
      if (email === demoEmail && password === demoPassword) {
        router.push('/dashboard');
        return;
      }

      setAuthError('Correo o contraseña incorrectos');
      setIsSubmitting(false);
    }, 700);
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
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold tracking-[0.28em] text-blue-300 uppercase">
            Poema 3.2
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Entra para mantener un margen con la finca.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
              Correo electrónico
            </label>
            <input
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
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
              <p className="mt-2 text-sm text-rose-300" id="email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="password">
              Contraseña
            </label>
            <input
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/25"
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
              <p className="mt-2 text-sm text-rose-300" id="password-error">
                {errors.password}
              </p>
            )}
          </div>

          {authError && (
            <p className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
              {authError}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <a
            className="block text-center text-sm text-blue-200 transition hover:text-white"
            href="#"
            onClick={(event) => event.preventDefault()}
          >
            Olvidé mi contraseña
          </a>
        </form>
      </section>
    </main>
  );
}