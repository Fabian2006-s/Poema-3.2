'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { Selector } from '@/components/ui/Selector';
import { InsigniaEstado } from '@/components/finca/InsigniaEstado';
import type { Implemento, Quimico, ResultadoMovimiento } from '@/lib/datos/tipos';
import { formatearCantidadQuimico, formatearFecha } from '@/lib/formato';
import { esFechaValida } from '@/lib/reglas/fechas';

type TipoElemento = 'implemento' | 'quimico';
type RespuestaApi = {
  datos?: ResultadoMovimiento;
  error?: { codigo?: string; mensaje?: string };
};

function mostrarCantidad(elemento: Implemento | Quimico): string {
  if ('unidad' in elemento) {
    return formatearCantidadQuimico(elemento.disponible, elemento.unidad);
  }
  const unidad = elemento.disponible === 1 ? 'unidad' : 'unidades';
  return `${new Intl.NumberFormat('es-CO').format(elemento.disponible)} ${unidad}`;
}

function mostrarCantidadMovimiento(resultado: ResultadoMovimiento): string {
  if ('unidad' in resultado.elemento) {
    return formatearCantidadQuimico(
      resultado.movimiento.cantidad,
      resultado.elemento.unidad,
    );
  }
  const unidad = resultado.movimiento.cantidad === 1 ? 'unidad' : 'unidades';
  return `${new Intl.NumberFormat('es-CO').format(resultado.movimiento.cantidad)} ${unidad}`;
}

export function FormularioMovimiento({
  implementos,
  quimicos,
  fechaInicial,
}: {
  implementos: Implemento[];
  quimicos: Quimico[];
  fechaInicial: string;
}) {
  const router = useRouter();
  const [tipoElemento, setTipoElemento] = useState<TipoElemento>('implemento');
  const [elementoId, setElementoId] = useState(implementos[0]?.id ?? '');
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>('salida');
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState(fechaInicial);
  const [motivo, setMotivo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ResultadoMovimiento | null>(null);

  const elementos = tipoElemento === 'implemento' ? implementos : quimicos;
  const elementoSeleccionado = elementos.find((elemento) => elemento.id === elementoId);
  const cantidadNumero = cantidad === '' ? Number.NaN : Number(cantidad);
  const errorCantidad =
    cantidad === '' && !enviado
      ? ''
      : !Number.isFinite(cantidadNumero) || cantidadNumero <= 0
        ? 'Ingresa una cantidad mayor que cero.'
        : tipoElemento === 'implemento' && !Number.isInteger(cantidadNumero)
          ? 'La cantidad de un implemento debe ser entera.'
          : '';
  const errorElemento = elementoId ? '' : 'Selecciona un elemento activo.';
  const errorFecha = fecha && esFechaValida(fecha) ? '' : 'Ingresa una fecha válida.';
  const errorMotivo =
    motivo.trim() || (!enviado && motivo.length === 0)
      ? ''
      : 'Ingresa el motivo del movimiento.';

  function cambiarTipoElemento(nuevoTipo: TipoElemento) {
    setTipoElemento(nuevoTipo);
    const disponibles = nuevoTipo === 'implemento' ? implementos : quimicos;
    setElementoId(disponibles[0]?.id ?? '');
    setResultado(null);
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviado(true);
    setError('');
    setResultado(null);
    if (
      !Number.isFinite(cantidadNumero) ||
      cantidadNumero <= 0 ||
      (tipoElemento === 'implemento' && !Number.isInteger(cantidadNumero)) ||
      !elementoId ||
      !esFechaValida(fecha) ||
      !motivo.trim()
    ) {
      setError('Corrige los campos marcados antes de registrar el movimiento.');
      return;
    }

    setCargando(true);
    try {
      const respuesta = await fetch('/api/finca/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoElemento,
          elementoId,
          tipoMovimiento,
          cantidad: cantidadNumero,
          motivo,
          fecha,
        }),
      });
      const cuerpo = (await respuesta.json()) as RespuestaApi;
      if (!respuesta.ok) {
        setError(cuerpo.error?.mensaje ?? 'No se pudo registrar el movimiento.');
        return;
      }
      if (!cuerpo.datos) throw new Error('La API no devolvió el movimiento registrado.');
      setResultado(cuerpo.datos);
      setCantidad('');
      setEnviado(false);
      router.refresh();
    } catch (errorCapturado) {
      setError(
        errorCapturado instanceof Error && errorCapturado.message
          ? errorCapturado.message
          : 'No se pudo conectar. Inténtalo de nuevo.',
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid gap-6">
      {error && <Aviso tipo="error">{error}</Aviso>}
      {resultado && (
        <Aviso
          tipo={resultado.elemento.inventarioBajo ? 'advertencia' : 'exito'}
          titulo="Movimiento registrado"
        >
          <p>
            Nueva existencia de {resultado.elemento.nombre}:{' '}
            <strong>{mostrarCantidad(resultado.elemento)}</strong>. Estado:{' '}
            <InsigniaEstado estado={resultado.elemento.estado} />
          </p>
          {resultado.elemento.inventarioBajo && (
            <p className="mt-1">La existencia quedó en el nivel mínimo o por debajo.</p>
          )}
          <p className="mt-1">
            {resultado.movimiento.tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'} de{' '}
            {mostrarCantidadMovimiento(resultado)} registrada el{' '}
            {formatearFecha(resultado.movimiento.fecha)}.
          </p>
        </Aviso>
      )}

      <form className="grid gap-5" noValidate onSubmit={guardar}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Selector
            etiqueta="Tipo de elemento"
            id="tipoElemento"
            onChange={(evento) => {
              const valor = evento.target.value;
              if (valor === 'implemento' || valor === 'quimico') cambiarTipoElemento(valor);
            }}
            value={tipoElemento}
          >
            <option value="implemento">Implemento</option>
            <option value="quimico">Químico</option>
          </Selector>
          <Selector
            etiqueta="Elemento activo"
            id="elementoId"
            onChange={(evento) => setElementoId(evento.target.value)}
            required
            value={elementoId}
          >
            <option value="">Selecciona un elemento</option>
            {elementos.map((elemento) => (
              <option key={elemento.id} value={elemento.id}>
                {elemento.nombre} · {mostrarCantidad(elemento)}
              </option>
            ))}
          </Selector>
        </div>
        {elementos.length === 0 && (
          <Aviso tipo="info">
            No hay {tipoElemento === 'implemento' ? 'implementos' : 'químicos'} activos para
            registrar movimientos.
          </Aviso>
        )}
        {elementoSeleccionado && (
          <p className="-mt-3 text-sm text-texto-suave">
            Existencia actual: {mostrarCantidad(elementoSeleccionado)}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <Selector
            etiqueta="Tipo de movimiento"
            id="tipoMovimiento"
            onChange={(evento) =>
              evento.target.value === 'entrada' || evento.target.value === 'salida'
                ? setTipoMovimiento(evento.target.value)
                : undefined
            }
            value={tipoMovimiento}
          >
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </Selector>
          <Campo
            etiqueta="Cantidad"
            id="cantidad"
            inputMode="decimal"
            min="0"
            onChange={(evento) => setCantidad(evento.target.value)}
            required
            step={tipoElemento === 'implemento' ? '1' : '0.01'}
            type="number"
            value={cantidad}
            error={errorCantidad}
          />
        </div>
        <p className="-mt-3 text-sm text-texto-suave">
          {tipoElemento === 'implemento'
            ? 'Los implementos se registran en unidades enteras.'
            : 'Los químicos aceptan hasta dos decimales.'}
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            etiqueta="Fecha"
            id="fecha"
            onChange={(evento) => setFecha(evento.target.value)}
            required
            type="date"
            value={fecha}
            error={fecha.length > 0 || enviado ? errorFecha : ''}
          />
          <Campo
            etiqueta="Motivo"
            id="motivo"
            maxLength={200}
            onChange={(evento) => setMotivo(evento.target.value)}
            required
            value={motivo}
            error={errorMotivo}
          />
        </div>
        {errorElemento && enviado && <p className="text-sm text-vencido">{errorElemento}</p>}
        <div className="flex flex-wrap justify-end">
          <Boton
            cargando={cargando}
            disabled={!elementoId || elementos.length === 0}
            type="submit"
          >
            Registrar movimiento
          </Boton>
        </div>
      </form>
    </div>
  );
}
