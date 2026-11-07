import Link from 'next/link';
import { FormularioImplemento } from '@/components/finca/FormularioImplemento';
import { Tarjeta } from '@/components/ui/Tarjeta';

export default function NuevoImplementoPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header>
        <Link className="text-sm font-semibold text-primario hover:underline" href="/finca/implementos">
          Volver a implementos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-texto">Nuevo implemento</h1>
        <p className="mt-2 text-texto-suave">Registra la existencia inicial con cantidades enteras.</p>
      </header>
      <Tarjeta>
        <FormularioImplemento />
      </Tarjeta>
    </div>
  );
}
