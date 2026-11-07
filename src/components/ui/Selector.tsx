import type { ReactNode, SelectHTMLAttributes } from 'react';

type SelectorProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  id: string;
  etiqueta: string;
  children: ReactNode;
  error?: string;
};

export function Selector({
  id,
  etiqueta,
  children,
  error,
  className = '',
  ...props
}: SelectorProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="grid gap-1.5">
      <label className="text-sm font-medium text-texto" htmlFor={id}>
        {etiqueta}
      </label>
      <select
        {...props}
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={`min-h-11 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primario ${className}`}
        id={id}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-vencido" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
