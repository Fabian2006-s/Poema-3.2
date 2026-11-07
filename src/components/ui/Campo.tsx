import type { InputHTMLAttributes } from 'react';

type CampoProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  id: string;
  etiqueta: string;
  error?: string;
};

export function Campo({ id, etiqueta, error, className = '', ...props }: CampoProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-texto" htmlFor={id}>
        {etiqueta}
      </label>
      <input
        {...props}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto placeholder:text-texto-suave focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primario ${className}`}
        id={id}
      />
      {error && (
        <p className="text-sm text-vencido" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
