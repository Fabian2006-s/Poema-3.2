import Link from 'next/link';
import { FormularioTrabajador } from '@/components/finca/FormularioTrabajador';
import { Tarjeta } from '@/components/ui/Tarjeta';

export default function NuevoTrabajadorPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header>
        <Link className="text-sm font-semibold text-primario hover:underline" href="/finca/trabajadores">
          Volver a trabajadores
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-texto">Nuevo trabajador</h1>
        <p className="mt-2 text-texto-suave">Completa los datos para registrar a una persona.</p>
      </header>
      <Tarjeta>
        <FormularioTrabajador />
      </Tarjeta>
    </div>
  );
}
