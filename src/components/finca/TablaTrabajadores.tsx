'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Trabajador } from '@/lib/dataService';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Modal } from '@/components/ui/Modal';
import { Selector } from '@/components/ui/Selector';
import { InsigniaEstado } from './InsigniaEstado';

export function TablaTrabajadores({
  trabajadores,
  filtro,
}: {
  trabajadores: Trabajador[];
  filtro: 'activo' | 'inactivo' | 'todos';
}) {
  const router = useRouter();
  const [seleccionado, setSeleccionado] = useState<Trabajador | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function cambiarEstado() {
    if (!seleccionado) return;
    setCargando(true);
    setError('');
    try {
      const respuesta = await fetch(`/api/finca/trabajadores/${seleccionado.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: seleccionado.estado === 'activo' ? 'inactivo' : 'activo',
        }),
      });
      const resultado = (await respuesta.json()) as { error?: { mensaje?: string } };
      if (!respuesta.ok) {
        setError(resultado.error?.mensaje ?? 'No se pudo actualizar el estado.');
        return;
      }
      setSeleccionado(null);
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <form action="/finca/trabajadores" className="flex flex-wrap items-end gap-3" method="get">
        <Selector defaultValue={filtro} etiqueta="Filtrar por estado" id="estado-filtro" name="estado">
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="todos">Todos</option>
        </Selector>
        <Boton type="submit" variante="secundario">
          Aplicar filtro
        </Boton>
      </form>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {trabajadores.length === 0 ? (
        <EstadoVacio
          descripcion="Prueba con otro filtro o registra una persona."
          titulo="No hay trabajadores para mostrar"
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-borde bg-superficie sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-primario-suave text-texto">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">Nombre</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Documento</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Cargo</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Teléfono</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Estado</th>
                  <th className="px-4 py-3 font-semibold" scope="col"><span className="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {trabajadores.map((trabajador) => (
                  <tr key={trabajador.id}>
                    <td className="px-4 py-3 font-medium text-texto">{trabajador.nombre}</td>
                    <td className="px-4 py-3 text-texto">{trabajador.documento}</td>
                    <td className="px-4 py-3 text-texto">{trabajador.cargo}</td>
                    <td className="px-4 py-3 text-texto">{trabajador.telefono || '—'}</td>
                    <td className="px-4 py-3"><InsigniaEstado estado={trabajador.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <Boton
                        onClick={() => setSeleccionado(trabajador)}
                        variante={trabajador.estado === 'activo' ? 'peligro' : 'secundario'}
                      >
                        {trabajador.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Boton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:hidden">
            {trabajadores.map((trabajador) => (
              <li className="rounded-lg border border-borde bg-superficie p-4" key={trabajador.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-texto">{trabajador.nombre}</h2>
                    <p className="mt-1 text-sm text-texto-suave">{trabajador.cargo}</p>
                  </div>
                  <InsigniaEstado estado={trabajador.estado} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-texto-suave">Documento</dt><dd className="text-texto">{trabajador.documento}</dd></div>
                  <div><dt className="text-texto-suave">Teléfono</dt><dd className="text-texto">{trabajador.telefono || '—'}</dd></div>
                </dl>
                <Boton
                  className="mt-4 w-full"
                  onClick={() => setSeleccionado(trabajador)}
                  variante={trabajador.estado === 'activo' ? 'peligro' : 'secundario'}
                >
                  {trabajador.estado === 'activo' ? 'Desactivar' : 'Activar'}
                </Boton>
              </li>
            ))}
          </ul>
        </>
      )}
      <Modal
        abierto={seleccionado !== null}
        onCerrar={() => setSeleccionado(null)}
        titulo={seleccionado?.estado === 'activo' ? 'Desactivar trabajador' : 'Activar trabajador'}
      >
        <p className="text-sm text-texto-suave">
          {seleccionado?.estado === 'activo'
            ? `¿Deseas desactivar a ${seleccionado.nombre}?`
            : `¿Deseas activar a ${seleccionado?.nombre}?`}
        </p>
        {error && <Aviso tipo="error">{error}</Aviso>}
        <div className="flex justify-end gap-3">
          <Boton onClick={() => setSeleccionado(null)} variante="secundario">
            Cancelar
          </Boton>
          <Boton
            cargando={cargando}
            onClick={cambiarEstado}
            variante={seleccionado?.estado === 'activo' ? 'peligro' : 'primario'}
          >
            Confirmar
          </Boton>
        </div>
      </Modal>
    </div>
  );
}
