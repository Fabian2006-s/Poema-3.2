'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { Selector } from '@/components/ui/Selector';

export function FormularioTrabajador() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);
    setError('');
    const datos = new FormData(evento.currentTarget);
    try {
      const respuesta = await fetch('/api/finca/trabajadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datos.get('nombre'),
          documento: datos.get('documento'),
          cargo: datos.get('cargo'),
          telefono: datos.get('telefono'),
          estado: datos.get('estado'),
        }),
      });
      const resultado = (await respuesta.json()) as {
        error?: { mensaje?: string };
      };
      if (!respuesta.ok) {
        setError(resultado.error?.mensaje ?? 'No se pudo guardar el trabajador.');
        return;
      }
      router.push('/finca/trabajadores');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={guardar}>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <Campo autoComplete="name" etiqueta="Nombre completo" id="nombre" maxLength={120} name="nombre" required />
      <Campo etiqueta="Documento" id="documento" maxLength={40} name="documento" required />
      <Campo etiqueta="Cargo" id="cargo" maxLength={80} name="cargo" required />
      <Campo autoComplete="tel" etiqueta="Teléfono" id="telefono" maxLength={40} name="telefono" type="tel" />
      <Selector defaultValue="activo" etiqueta="Estado" id="estado" name="estado">
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
      </Selector>
      <div className="flex flex-wrap justify-end gap-3">
        <Boton
          onClick={() => router.push('/finca/trabajadores')}
          variante="secundario"
        >
          Cancelar
        </Boton>
        <Boton cargando={cargando} type="submit">
          Guardar trabajador
        </Boton>
      </div>
    </form>
  );
}
