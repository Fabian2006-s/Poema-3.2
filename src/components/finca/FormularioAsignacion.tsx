'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Selector } from '@/components/ui/Selector';
import type { AsignacionDetalle, Implemento, Trabajador } from '@/lib/dataService';
import { formatearFecha } from '@/lib/formato';

type ErrorApi = { error?: { mensaje?: string } };

export function FormularioAsignacion({
  trabajadores,
  implementos,
  asignaciones,
}: {
  trabajadores: Trabajador[];
  implementos: Implemento[];
  asignaciones: AsignacionDetalle[];
}) {
  const router = useRouter();
  const [trabajadorId, setTrabajadorId] = useState(trabajadores[0]?.id ?? '');
  const [implementoId, setImplementoId] = useState(implementos[0]?.id ?? '');
  const [cantidad, setCantidad] = useState('1');
  const [cargando, setCargando] = useState(false);
  const [devolviendo, setDevolviendo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  async function asignar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setExito('');
    setCargando(true);
    try {
      const respuesta = await fetch('/api/finca/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trabajadorId,
          implementoId,
          cantidad: Number(cantidad),
        }),
      });
      const cuerpo = (await respuesta.json()) as ErrorApi;
      if (!respuesta.ok) {
        setError(cuerpo.error?.mensaje ?? 'No se pudo asignar el implemento.');
        return;
      }
      setExito('Implemento asignado y existencia actualizada.');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  async function devolver(asignacion: AsignacionDetalle) {
    setError('');
    setExito('');
    setDevolviendo(asignacion.id);
    try {
      const respuesta = await fetch(
        `/api/finca/asignaciones/${asignacion.id}/devolver`,
        { method: 'POST' },
      );
      const cuerpo = (await respuesta.json()) as ErrorApi;
      if (!respuesta.ok) {
        setError(cuerpo.error?.mensaje ?? 'No se pudo registrar la devolución.');
        return;
      }
      setExito('Devolución registrada y existencia reintegrada.');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setDevolviendo(null);
    }
  }

  return (
    <div className="grid gap-6">
      {error && <Aviso tipo="error">{error}</Aviso>}
      {exito && <Aviso tipo="exito">{exito}</Aviso>}
      {trabajadores.length === 0 || implementos.length === 0 ? (
        <Aviso tipo="advertencia">
          Para asignar implementos se necesita al menos un trabajador activo y un implemento activo.
        </Aviso>
      ) : (
        <form className="grid gap-4 rounded-lg border border-borde bg-superficie p-5 sm:grid-cols-4" onSubmit={asignar}>
          <Selector
            etiqueta="Trabajador activo"
            id="trabajadorId"
            onChange={(evento) => setTrabajadorId(evento.target.value)}
            required
            value={trabajadorId}
          >
            {trabajadores.map((trabajador) => (
              <option key={trabajador.id} value={trabajador.id}>
                {trabajador.nombre} · {trabajador.cargo}
              </option>
            ))}
          </Selector>
          <Selector
            etiqueta="Implemento activo"
            id="implementoId"
            onChange={(evento) => setImplementoId(evento.target.value)}
            required
            value={implementoId}
          >
            {implementos.map((implemento) => (
              <option key={implemento.id} value={implemento.id}>
                {implemento.nombre} · {implemento.disponible} disponibles
              </option>
            ))}
          </Selector>
          <Campo
            etiqueta="Cantidad"
            id="cantidad"
            min="1"
            onChange={(evento) => setCantidad(evento.target.value)}
            required
            step="1"
            type="number"
            value={cantidad}
          />
          <div className="flex items-end">
            <Boton className="w-full" cargando={cargando} type="submit">
              Asignar
            </Boton>
          </div>
        </form>
      )}

      <section className="grid gap-3">
        <h2 className="text-xl font-bold text-texto">Historial de asignaciones</h2>
        {asignaciones.length === 0 ? (
          <EstadoVacio
            descripcion="Las asignaciones y devoluciones aparecerán aquí."
            titulo="Aún no hay asignaciones"
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-borde bg-superficie">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-primario-suave text-texto">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">Trabajador</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Implemento</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Cantidad</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Fecha</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Estado</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {asignaciones.map((asignacion) => (
                  <tr key={asignacion.id}>
                    <td className="px-4 py-3">{asignacion.trabajadorNombre}</td>
                    <td className="px-4 py-3">{asignacion.implementoNombre}</td>
                    <td className="px-4 py-3">{asignacion.cantidad}</td>
                    <td className="px-4 py-3">{formatearFecha(asignacion.fecha)}</td>
                    <td className="px-4 py-3">
                      {asignacion.estado === 'entregado' ? 'Entregado' : 'Devuelto'}
                    </td>
                    <td className="px-4 py-3">
                      {asignacion.estado === 'entregado' && (
                        <Boton
                          cargando={devolviendo === asignacion.id}
                          onClick={() => void devolver(asignacion)}
                          variante="secundario"
                        >
                          Registrar devolución
                        </Boton>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
