'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';

export function FormularioImplemento() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);
    setError('');
    const datos = new FormData(evento.currentTarget);
    try {
      const respuesta = await fetch('/api/finca/implementos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datos.get('nombre'),
          categoria: datos.get('categoria'),
          disponible: Number(datos.get('disponible')),
          minima: Number(datos.get('minima')),
        }),
      });
      const resultado = (await respuesta.json()) as { error?: { mensaje?: string } };
      if (!respuesta.ok) {
        setError(resultado.error?.mensaje ?? 'No se pudo guardar el implemento.');
        return;
      }
      router.push('/finca/implementos');
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
      <Campo etiqueta="Nombre" id="nombre" maxLength={120} name="nombre" required />
      <Campo etiqueta="Categoría" id="categoria" maxLength={60} name="categoria" required />
      <Campo
        etiqueta="Cantidad disponible"
        id="disponible"
        min="0"
        name="disponible"
        required
        step="1"
        type="number"
      />
      <Campo
        etiqueta="Cantidad mínima"
        id="minima"
        min="0"
        name="minima"
        required
        step="1"
        type="number"
      />
      <p className="-mt-3 text-sm text-texto-suave">Las cantidades de implementos deben ser enteras.</p>
      <div className="flex flex-wrap justify-end gap-3">
        <Boton onClick={() => router.push('/finca/implementos')} variante="secundario">
          Cancelar
        </Boton>
        <Boton cargando={cargando} type="submit">
          Guardar implemento
        </Boton>
      </div>
    </form>
  );
}
