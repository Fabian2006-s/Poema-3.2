import Link from 'next/link';
import { Tarjeta } from '@/components/ui/Tarjeta';

const modulos = [
  {
    titulo: 'Parcelas',
    descripcion: 'Organiza las áreas de cultivo y su extensión.',
    href: '/finca/gestion/parcelas',
    categoria: 'Planeación',
  },
  {
    titulo: 'Producción',
    descripcion: 'Registra racimos y cajas cosechadas por parcela.',
    href: '/finca/gestion/produccion',
    categoria: 'Cultivo',
  },
  {
    titulo: 'Agua y riego',
    descripcion: 'Controla la duración y el volumen estimado de cada riego.',
    href: '/finca/gestion/riego',
    categoria: 'Cultivo',
  },
  {
    titulo: 'Asistencia',
    descripcion: 'Lleva el registro diario de jornadas y novedades del personal.',
    href: '/finca/gestion/asistencia',
    categoria: 'Personal',
  },
  {
    titulo: 'Maquinaria y equipos',
    descripcion: 'Registra equipos, lecturas, usos y mantenimientos.',
    href: '/finca/gestion/maquinaria',
    categoria: 'Operación',
  },
  {
    titulo: 'Empaque',
    descripcion: 'Controla cajas empacadas y rechazadas.',
    href: '/finca/gestion/empaque',
    categoria: 'Poscosecha',
  },
  {
    titulo: 'Ventas',
    descripcion: 'Registra clientes, cajas comercializadas y valor en COP.',
    href: '/finca/gestion/ventas',
    categoria: 'Comercialización',
  },
  {
    titulo: 'Gastos',
    descripcion: 'Registra gastos de finca por categoría y valor.',
    href: '/finca/gestion/gastos',
    categoria: 'Administración',
  },
  {
    titulo: 'Materiales de empaque',
    descripcion: 'Administra insumos y existencias mínimas.',
    href: '/finca/gestion/materiales',
    categoria: 'Inventario',
  },
];

export default function GestionPage() {
  return (
    <div className="grid gap-7">
      <header>
        <p className="text-xs font-bold tracking-[0.16em] text-primario uppercase">Gestión de finca</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-texto">Operación integral</h1>
        <p className="mt-2 max-w-2xl text-texto-suave">
          Accede a los módulos de cultivo, personal, poscosecha, equipos, inventario y administración.
        </p>
      </header>
      <section aria-label="Módulos de gestión" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modulos.map((modulo) => (
          <Link className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario" href={modulo.href} key={modulo.href}>
            <Tarjeta className="h-full transition group-hover:-translate-y-1 group-hover:border-primario/30 group-hover:shadow-lg">
              <p className="text-xs font-bold tracking-[0.14em] text-primario uppercase">{modulo.categoria}</p>
              <h2 className="mt-3 text-xl font-semibold text-texto">{modulo.titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-texto-suave">{modulo.descripcion}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primario">
                Abrir módulo <span aria-hidden="true">→</span>
              </span>
            </Tarjeta>
          </Link>
        ))}
        <Link className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario" href="/finca/gestion/registro-maquinaria">
          <Tarjeta className="h-full transition group-hover:-translate-y-1 group-hover:border-primario/30 group-hover:shadow-lg">
            <p className="text-xs font-bold tracking-[0.14em] text-primario uppercase">Operación</p>
            <h2 className="mt-3 text-xl font-semibold text-texto">Uso y mantenimiento</h2>
            <p className="mt-2 text-sm leading-6 text-texto-suave">Añade lecturas de medidor, reparaciones y costos de servicio.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primario">
              Abrir módulo <span aria-hidden="true">→</span>
            </span>
          </Tarjeta>
        </Link>
        <Link className="group rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario" href="/finca/gestion/movimientos-materiales">
          <Tarjeta className="h-full transition group-hover:-translate-y-1 group-hover:border-primario/30 group-hover:shadow-lg">
            <p className="text-xs font-bold tracking-[0.14em] text-primario uppercase">Inventario</p>
            <h2 className="mt-3 text-xl font-semibold text-texto">Movimientos de materiales</h2>
            <p className="mt-2 text-sm leading-6 text-texto-suave">Registra entradas y salidas del inventario de empaque.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primario">
              Abrir módulo <span aria-hidden="true">→</span>
            </span>
          </Tarjeta>
        </Link>
      </section>
    </div>
  );
}
