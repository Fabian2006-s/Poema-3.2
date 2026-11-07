import { FormularioAsignacion } from '@/components/finca/FormularioAsignacion';
import {
  listarAsignaciones,
  listarImplementos,
  listarTrabajadores,
} from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export default async function AsignacionesPage() {
  const [trabajadores, implementos, asignaciones] = await Promise.all([
    listarTrabajadores({ estado: 'activo' }),
    listarImplementos(),
    listarAsignaciones(),
  ]);

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold text-primario">Control de implementos</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">
          Asignaciones y devoluciones
        </h1>
        <p className="mt-2 text-texto-suave">
          Entrega implementos a trabajadores activos y registra su devolución.
        </p>
      </header>
      <FormularioAsignacion
        asignaciones={asignaciones}
        implementos={implementos}
        trabajadores={trabajadores}
      />
    </div>
  );
}
