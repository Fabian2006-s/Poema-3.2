import Link from 'next/link';
import { FormularioQuimico } from '@/components/finca/FormularioQuimico';
import { Tarjeta } from '@/components/ui/Tarjeta';

export default function NuevoQuimicoPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header>
        <Link className="text-sm font-semibold text-primario hover:underline" href="/finca/quimicos">
          Volver a químicos
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-texto">Nuevo químico</h1>
        <p className="mt-2 text-texto-suave">Ingresa las cantidades en decimal y la fecha de vencimiento.</p>
      </header>
      <Tarjeta>
        <FormularioQuimico />
      </Tarjeta>
    </div>
  );
}
