'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type {
  DatosModuloGestion,
  FilaGestion,
  ModuloGestion as ModuloGestionId,
} from '@/lib/dataService';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Selector } from '@/components/ui/Selector';
import { Tarjeta } from '@/components/ui/Tarjeta';

type CampoFormulario = {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'numero' | 'fecha' | 'selector' | 'texto-largo';
  requerido?: boolean;
  minimo?: number;
  maximo?: number;
  paso?: number;
  opciones?: { valor: string; etiqueta: string }[];
};

type ConfiguracionModulo = {
  titulo: string;
  descripcion: string;
  accion: string;
  campos: CampoFormulario[];
  valoresIniciales: Record<string, string>;
};

type TipoRecursoGestion = 'parcela' | 'maquinaria' | 'material';

const fechaCampo: CampoFormulario = {
  nombre: 'fecha',
  etiqueta: 'Fecha',
  tipo: 'fecha',
  requerido: true,
};

const camposParcela: CampoFormulario[] = [
  { nombre: 'nombre', etiqueta: 'Nombre de la parcela', tipo: 'texto', requerido: true },
  { nombre: 'areaHa', etiqueta: 'Área en hectáreas (opcional)', tipo: 'numero', minimo: 0.01, paso: 0.01 },
];

const configuraciones: Record<ModuloGestionId, ConfiguracionModulo> = {
  parcelas: {
    titulo: 'Parcelas',
    descripcion: 'Organiza las áreas de cultivo que usarás en producción, riego y empaque.',
    accion: 'Guardar parcela',
    campos: camposParcela,
    valoresIniciales: {},
  },
  produccion: {
    titulo: 'Control de producción',
    descripcion: 'Registra la cosecha por fecha y parcela en racimos y cajas.',
    accion: 'Guardar producción',
    campos: [
      fechaCampo,
      { nombre: 'parcelaId', etiqueta: 'Parcela', tipo: 'selector', requerido: true },
      { nombre: 'racimos', etiqueta: 'Racimos cosechados', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'cajas', etiqueta: 'Cajas obtenidas', tipo: 'numero', requerido: true, minimo: 0 },
      { nombre: 'observacion', etiqueta: 'Observaciones', tipo: 'texto-largo' },
    ],
    valoresIniciales: { cajas: '0' },
  },
  riego: {
    titulo: 'Agua y riego',
    descripcion: 'Lleva el control de riegos por parcela, duración y volumen estimado de agua.',
    accion: 'Guardar riego',
    campos: [
      fechaCampo,
      { nombre: 'parcelaId', etiqueta: 'Parcela', tipo: 'selector', requerido: true },
      { nombre: 'metodo', etiqueta: 'Método de riego', tipo: 'texto', requerido: true },
      { nombre: 'duracionMinutos', etiqueta: 'Duración (minutos)', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'volumenM3', etiqueta: 'Volumen estimado (m³)', tipo: 'numero', requerido: true, minimo: 0.01, paso: 0.01 },
      { nombre: 'observacion', etiqueta: 'Observaciones', tipo: 'texto-largo' },
    ],
    valoresIniciales: {},
  },
  asistencia: {
    titulo: 'Asistencia de trabajadores',
    descripcion: 'Registra la jornada diaria sin incluir cálculo de nómina. Una corrección del mismo día reemplaza la marca previa del trabajador.',
    accion: 'Guardar asistencia',
    campos: [
      fechaCampo,
      { nombre: 'trabajadorId', etiqueta: 'Trabajador', tipo: 'selector', requerido: true },
      {
        nombre: 'estado',
        etiqueta: 'Novedad',
        tipo: 'selector',
        requerido: true,
        opciones: [
          { valor: 'asistio', etiqueta: 'Asistió' },
          { valor: 'falta', etiqueta: 'Falta' },
          { valor: 'permiso', etiqueta: 'Permiso' },
          { valor: 'incapacidad', etiqueta: 'Incapacidad' },
        ],
      },
      { nombre: 'minutosTrabajados', etiqueta: 'Minutos trabajados', tipo: 'numero', requerido: true, minimo: 0 },
      { nombre: 'observacion', etiqueta: 'Observaciones', tipo: 'texto-largo' },
    ],
    valoresIniciales: { estado: 'asistio', minutosTrabajados: '480' },
  },
  maquinaria: {
    titulo: 'Maquinaria y equipos',
    descripcion: 'Crea el registro de cada equipo y define si su medidor usa horas o kilómetros.',
    accion: 'Guardar equipo',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre del equipo', tipo: 'texto', requerido: true },
      { nombre: 'categoria', etiqueta: 'Tipo de equipo', tipo: 'texto', requerido: true },
      { nombre: 'identificador', etiqueta: 'Placa o identificador (opcional)', tipo: 'texto' },
      {
        nombre: 'unidadMedidor',
        etiqueta: 'Unidad del medidor',
        tipo: 'selector',
        requerido: true,
        opciones: [
          { valor: 'horas', etiqueta: 'Horas' },
          { valor: 'km', etiqueta: 'Kilómetros' },
        ],
      },
    ],
    valoresIniciales: { unidadMedidor: 'horas' },
  },
  'registro-maquinaria': {
    titulo: 'Uso y mantenimiento',
    descripcion: 'Registra lecturas del medidor y mantenimientos con su costo y próximo servicio.',
    accion: 'Guardar registro',
    campos: [
      { nombre: 'maquinariaId', etiqueta: 'Equipo', tipo: 'selector', requerido: true },
      fechaCampo,
      {
        nombre: 'tipoRegistro',
        etiqueta: 'Tipo de registro',
        tipo: 'selector',
        requerido: true,
        opciones: [
          { valor: 'uso', etiqueta: 'Uso' },
          { valor: 'mantenimiento', etiqueta: 'Mantenimiento' },
        ],
      },
      { nombre: 'lectura', etiqueta: 'Lectura actual (opcional para mantenimiento)', tipo: 'numero', minimo: 0, maximo: 21474836.47, paso: 0.01 },
      { nombre: 'proximaLectura', etiqueta: 'Próximo servicio en (opcional)', tipo: 'numero', minimo: 0, maximo: 21474836.47, paso: 0.01 },
      { nombre: 'costoCop', etiqueta: 'Costo (COP, opcional)', tipo: 'numero', requerido: true, minimo: 0 },
      { nombre: 'detalle', etiqueta: 'Detalle del uso o mantenimiento', tipo: 'texto', requerido: true },
    ],
    valoresIniciales: { tipoRegistro: 'uso', costoCop: '0' },
  },
  empaque: {
    titulo: 'Empaque',
    descripcion: 'Controla las cajas empacadas y rechazadas por parcela y fecha.',
    accion: 'Guardar empaque',
    campos: [
      fechaCampo,
      { nombre: 'parcelaId', etiqueta: 'Parcela', tipo: 'selector', requerido: true },
      { nombre: 'cajas', etiqueta: 'Cajas empacadas', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'rechazos', etiqueta: 'Cajas rechazadas', tipo: 'numero', requerido: true, minimo: 0 },
      { nombre: 'observacion', etiqueta: 'Observaciones', tipo: 'texto-largo' },
    ],
    valoresIniciales: { rechazos: '0' },
  },
  ventas: {
    titulo: 'Comercialización y ventas',
    descripcion: 'Registra cliente, cajas vendidas y valor total recibido o pactado en pesos colombianos.',
    accion: 'Guardar venta',
    campos: [
      fechaCampo,
      { nombre: 'parcelaId', etiqueta: 'Parcela o lote', tipo: 'selector', requerido: true },
      { nombre: 'cliente', etiqueta: 'Cliente', tipo: 'texto', requerido: true },
      { nombre: 'cajas', etiqueta: 'Cajas vendidas', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'valorCop', etiqueta: 'Valor total (COP)', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'remision', etiqueta: 'Remisión (opcional)', tipo: 'texto' },
      { nombre: 'observacion', etiqueta: 'Observaciones', tipo: 'texto-largo' },
    ],
    valoresIniciales: {},
  },
  gastos: {
    titulo: 'Control de gastos',
    descripcion: 'Registra cada gasto por fecha, categoría, descripción y valor en pesos colombianos.',
    accion: 'Guardar gasto',
    campos: [
      fechaCampo,
      { nombre: 'categoria', etiqueta: 'Categoría', tipo: 'texto', requerido: true },
      { nombre: 'descripcion', etiqueta: 'Descripción', tipo: 'texto', requerido: true },
      { nombre: 'valorCop', etiqueta: 'Valor (COP)', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'formaPago', etiqueta: 'Forma de pago (opcional)', tipo: 'texto' },
    ],
    valoresIniciales: {},
  },
  materiales: {
    titulo: 'Materiales de empaque',
    descripcion: 'Crea el catálogo de cajas, bolsas, etiquetas y otros insumos; el stock se ajusta con movimientos.',
    accion: 'Guardar material',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre del material', tipo: 'texto', requerido: true },
      { nombre: 'unidad', etiqueta: 'Unidad de conteo', tipo: 'texto', requerido: true },
      { nombre: 'minima', etiqueta: 'Existencia mínima', tipo: 'numero', requerido: true, minimo: 0 },
    ],
    valoresIniciales: { unidad: 'unidades', minima: '0' },
  },
  'movimientos-materiales': {
    titulo: 'Movimientos de materiales',
    descripcion: 'Registra entradas y salidas; el inventario se actualiza junto con el movimiento.',
    accion: 'Guardar movimiento',
    campos: [
      fechaCampo,
      { nombre: 'materialId', etiqueta: 'Material', tipo: 'selector', requerido: true },
      {
        nombre: 'tipoMovimiento',
        etiqueta: 'Movimiento',
        tipo: 'selector',
        requerido: true,
        opciones: [
          { valor: 'entrada', etiqueta: 'Entrada' },
          { valor: 'salida', etiqueta: 'Salida' },
        ],
      },
      { nombre: 'cantidad', etiqueta: 'Cantidad', tipo: 'numero', requerido: true, minimo: 1 },
      { nombre: 'motivo', etiqueta: 'Motivo', tipo: 'texto', requerido: true },
    ],
    valoresIniciales: { tipoMovimiento: 'entrada' },
  },
};

const etiquetasModulo: Record<ModuloGestionId, string> = {
  parcelas: 'parcelas',
  produccion: 'producción',
  riego: 'riegos',
  asistencia: 'asistencia',
  maquinaria: 'maquinaria',
  'registro-maquinaria': 'registros de maquinaria',
  empaque: 'empaques',
  ventas: 'ventas',
  gastos: 'gastos',
  materiales: 'materiales',
  'movimientos-materiales': 'movimientos de materiales',
};

function opcionesCampo(
  nombre: string,
  datos: DatosModuloGestion,
  campo: CampoFormulario,
): { valor: string; etiqueta: string }[] {
  if (campo.opciones) return campo.opciones;
  const fuente =
    nombre === 'parcelaId'
      ? datos.parcelas
      : nombre === 'trabajadorId'
        ? datos.trabajadores
        : nombre === 'maquinariaId'
          ? datos.maquinaria
          : nombre === 'materialId'
            ? datos.materiales
            : [];
  return fuente.map((opcion) => ({ valor: opcion.id, etiqueta: opcion.nombre }));
}

function necesitaRelacion(modulo: ModuloGestionId, datos: DatosModuloGestion): string | null {
  if (['produccion', 'riego', 'empaque', 'ventas'].includes(modulo) && datos.parcelas.length === 0) {
    return 'parcelas';
  }
  if (modulo === 'asistencia' && datos.trabajadores.length === 0) return 'trabajadores';
  if (modulo === 'registro-maquinaria' && datos.maquinaria.length === 0) return 'maquinaria';
  if (modulo === 'movimientos-materiales' && datos.materiales.length === 0) return 'materiales';
  return null;
}

function rutaRelacion(recurso: string): string {
  switch (recurso) {
    case 'parcelas':
      return '/finca/gestion/parcelas';
    case 'trabajadores':
      return '/finca/trabajadores';
    case 'maquinaria':
      return '/finca/gestion/maquinaria';
    default:
      return '/finca/gestion/materiales';
  }
}

function valorOpcional(valor: string | undefined): string | undefined {
  const limpio = valor?.trim();
  return limpio ? limpio : undefined;
}

function valorNumero(valores: Record<string, string>, nombre: string): number | undefined {
  const valor = valores[nombre];
  return valor === undefined || valor === '' ? undefined : Number(valor);
}

function crearDatosOperacion(
  modulo: ModuloGestionId,
  valores: Record<string, string>,
): Record<string, unknown> {
  const numero = (nombre: string) => valorNumero(valores, nombre);
  const texto = (nombre: string) => valores[nombre] ?? '';
  switch (modulo) {
    case 'parcelas':
      return { tipo: 'crear_parcela', nombre: texto('nombre'), areaHa: numero('areaHa') };
    case 'produccion':
      return {
        tipo: 'registrar_produccion',
        parcelaId: texto('parcelaId'),
        fecha: texto('fecha'),
        racimos: numero('racimos'),
        cajas: numero('cajas'),
        observacion: valorOpcional(valores.observacion),
      };
    case 'riego':
      return {
        tipo: 'registrar_riego',
        parcelaId: texto('parcelaId'),
        fecha: texto('fecha'),
        metodo: texto('metodo'),
        duracionMinutos: numero('duracionMinutos'),
        volumenM3: numero('volumenM3'),
        observacion: valorOpcional(valores.observacion),
      };
    case 'asistencia':
      return {
        tipo: 'registrar_asistencia',
        trabajadorId: texto('trabajadorId'),
        fecha: texto('fecha'),
        estado: texto('estado'),
        minutosTrabajados: numero('minutosTrabajados'),
        observacion: valorOpcional(valores.observacion),
      };
    case 'maquinaria':
      return {
        tipo: 'crear_maquinaria',
        nombre: texto('nombre'),
        categoria: texto('categoria'),
        identificador: valorOpcional(valores.identificador),
        unidadMedidor: texto('unidadMedidor'),
      };
    case 'registro-maquinaria':
      return {
        tipo: 'registrar_maquinaria',
        maquinariaId: texto('maquinariaId'),
        fecha: texto('fecha'),
        tipoRegistro: texto('tipoRegistro'),
        lectura: numero('lectura'),
        proximaLectura: numero('proximaLectura'),
        costoCop: numero('costoCop'),
        detalle: texto('detalle'),
      };
    case 'empaque':
      return {
        tipo: 'registrar_empaque',
        parcelaId: texto('parcelaId'),
        fecha: texto('fecha'),
        cajas: numero('cajas'),
        rechazos: numero('rechazos'),
        observacion: valorOpcional(valores.observacion),
      };
    case 'ventas':
      return {
        tipo: 'registrar_venta',
        parcelaId: texto('parcelaId'),
        fecha: texto('fecha'),
        cliente: texto('cliente'),
        cajas: numero('cajas'),
        valorCop: numero('valorCop'),
        remision: valorOpcional(valores.remision),
        observacion: valorOpcional(valores.observacion),
      };
    case 'gastos':
      return {
        tipo: 'registrar_gasto',
        fecha: texto('fecha'),
        categoria: texto('categoria'),
        descripcion: texto('descripcion'),
        valorCop: numero('valorCop'),
        formaPago: valorOpcional(valores.formaPago),
      };
    case 'materiales':
      return {
        tipo: 'crear_material',
        nombre: texto('nombre'),
        unidad: texto('unidad'),
        minima: numero('minima'),
      };
    case 'movimientos-materiales':
      return {
        tipo: 'registrar_movimiento_material',
        fecha: texto('fecha'),
        materialId: texto('materialId'),
        tipoMovimiento: texto('tipoMovimiento'),
        cantidad: numero('cantidad'),
        motivo: texto('motivo'),
      };
  }
}

function mensajeDeRespuesta(resultado: unknown): string | undefined {
  if (typeof resultado !== 'object' || resultado === null || !('error' in resultado)) {
    return undefined;
  }
  const error = resultado.error;
  if (typeof error !== 'object' || error === null || !('mensaje' in error)) return undefined;
  return typeof error.mensaje === 'string' ? error.mensaje : undefined;
}

function tipoCambioEstado(tipo: TipoRecursoGestion): string {
  switch (tipo) {
    case 'parcela':
      return 'estado_parcela';
    case 'maquinaria':
      return 'estado_maquinaria';
    case 'material':
      return 'estado_material';
  }
}

export function ModuloGestion({
  modulo,
  datos,
  fechaHoy,
}: {
  modulo: ModuloGestionId;
  datos: DatosModuloGestion;
  fechaHoy: string;
}) {
  const router = useRouter();
  const configuracion = configuraciones[modulo];
  const [valores, setValores] = useState<Record<string, string>>({
    ...configuracion.valoresIniciales,
    ...(configuracion.campos.some((campo) => campo.nombre === 'fecha') ? { fecha: fechaHoy } : {}),
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [recursoActualizando, setRecursoActualizando] = useState<string | null>(null);
  const relacionFaltante = necesitaRelacion(modulo, datos);

  function cambiarValor(nombre: string, valor: string) {
    setValores((actuales) => ({
      ...actuales,
      [nombre]: valor,
      ...(modulo === 'asistencia' && nombre === 'estado'
        ? { minutosTrabajados: valor === 'asistio' ? '480' : '0' }
        : {}),
    }));
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCargando(true);
    setError('');
    setExito('');
    try {
      const respuesta = await fetch('/api/finca/operaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crearDatosOperacion(modulo, valores)),
      });
      const resultado: unknown = await respuesta.json();
      if (!respuesta.ok) {
        setError(mensajeDeRespuesta(resultado) ?? 'No se pudo guardar el registro.');
        return;
      }
      setValores({
        ...configuracion.valoresIniciales,
        ...(configuracion.campos.some((campo) => campo.nombre === 'fecha') ? { fecha: fechaHoy } : {}),
      });
      setExito('Registro guardado correctamente.');
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(fila: FilaGestion) {
    const recurso = fila.estadoRecurso;
    if (!recurso) return;
    const activo = !recurso.activo;
    if (
      !activo &&
      !window.confirm(`¿Desactivar ${fila.titulo}? El historial se conservará.`)
    ) {
      return;
    }
    setError('');
    setExito('');
    setRecursoActualizando(fila.id);
    try {
      const respuesta = await fetch('/api/finca/operaciones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoCambioEstado(recurso.tipo),
          id: fila.id,
          activo,
        }),
      });
      const resultado: unknown = await respuesta.json();
      if (!respuesta.ok) {
        setError(mensajeDeRespuesta(resultado) ?? 'No se pudo actualizar el estado.');
        return;
      }
      setExito(`Registro ${activo ? 'activado' : 'desactivado'}.`);
      router.refresh();
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setRecursoActualizando(null);
    }
  }

  return (
    <div className="grid gap-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-primario hover:underline" href="/finca">
            Volver al panel
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-texto">{configuracion.titulo}</h1>
          <p className="mt-2 max-w-2xl text-texto-suave">{configuracion.descripcion}</p>
        </div>
        {modulo === 'materiales' && (
          <Link className="text-sm font-semibold text-primario hover:underline" href="/finca/gestion/movimientos-materiales">
            Registrar movimiento de stock
          </Link>
        )}
        {modulo === 'maquinaria' && (
          <Link className="text-sm font-semibold text-primario hover:underline" href="/finca/gestion/registro-maquinaria">
            Registrar uso o mantenimiento
          </Link>
        )}
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <Tarjeta titulo={configuracion.accion} descripcion="Los registros operativos quedan guardados en la base de datos.">
          <form className="grid gap-4" onSubmit={guardar}>
            {error && <Aviso tipo="error">{error}</Aviso>}
            {exito && <Aviso tipo="exito">{exito}</Aviso>}
            {relacionFaltante && (
              <Aviso tipo="advertencia">
                Primero registra {relacionFaltante} para continuar.{' '}
                <Link className="font-semibold underline" href={rutaRelacion(relacionFaltante)}>
                  Ir a {relacionFaltante}
                </Link>
              </Aviso>
            )}
            {configuracion.campos.map((campo) => {
              const id = `${modulo}-${campo.nombre}`;
              const value = valores[campo.nombre] ?? '';
              if (campo.tipo === 'selector') {
                const opciones = opcionesCampo(campo.nombre, datos, campo);
                return (
                  <Selector
                    disabled={cargando || (opciones.length === 0 && !campo.opciones)}
                    id={id}
                    key={campo.nombre}
                    etiqueta={campo.etiqueta}
                    name={campo.nombre}
                    onChange={(evento) => cambiarValor(campo.nombre, evento.target.value)}
                    required={campo.requerido}
                    value={value}
                  >
                    <option value="">Selecciona una opción</option>
                    {opciones.map((opcion) => (
                      <option key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </option>
                    ))}
                  </Selector>
                );
              }
              if (campo.tipo === 'texto-largo') {
                return (
                  <div className="grid gap-1.5" key={campo.nombre}>
                    <label className="text-sm font-medium text-texto" htmlFor={id}>
                      {campo.etiqueta}
                    </label>
                    <textarea
                      className="min-h-24 w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-texto placeholder:text-texto-suave focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primario"
                      id={id}
                      maxLength={300}
                      name={campo.nombre}
                      onChange={(evento) => cambiarValor(campo.nombre, evento.target.value)}
                      value={value}
                    />
                  </div>
                );
              }
              return (
                <Campo
                  id={id}
                  key={campo.nombre}
                  etiqueta={campo.etiqueta}
                  max={campo.maximo}
                  maxLength={campo.tipo === 'texto' ? 200 : undefined}
                  min={campo.minimo}
                  name={campo.nombre}
                  onChange={(evento) => cambiarValor(campo.nombre, evento.target.value)}
                  required={campo.requerido}
                  step={campo.paso}
                  type={campo.tipo === 'numero' ? 'number' : campo.tipo === 'fecha' ? 'date' : 'text'}
                  value={value}
                />
              );
            })}
            <Boton
              cargando={cargando}
              className="w-full"
              disabled={Boolean(relacionFaltante)}
              type="submit"
            >
              {configuracion.accion}
            </Boton>
          </form>
        </Tarjeta>

        <Tarjeta titulo={`Registros de ${etiquetasModulo[modulo]}`} descripcion="Los más recientes aparecen primero.">
          {datos.filas.length === 0 ? (
            <EstadoVacio
              titulo="Todavía no hay registros"
              descripcion="Cuando guardes el primer registro de este módulo, aparecerá aquí."
            />
          ) : (
            <div className="grid gap-3">
              {datos.filas.map((fila) => (
                <article
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-borde/80 bg-fondo/50 p-4"
                  key={fila.id}
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-texto">{fila.titulo}</h3>
                    <p className="mt-1 break-words text-sm text-texto-suave">{fila.detalle}</p>
                    {fila.fecha && (
                      <time className="mt-2 block text-xs font-medium text-texto-suave" dateTime={fila.fecha}>
                        {fila.fecha}
                      </time>
                    )}
                  </div>
                  {(fila.indicador || fila.estadoRecurso) && (
                    <div className="flex shrink-0 items-center gap-3">
                      {fila.indicador && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            fila.indicador === 'Inventario bajo'
                              ? 'bg-amber-100 text-amber-900'
                              : fila.indicador === 'Inactiva' || fila.indicador === 'Inactivo'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-primario-suave text-primario'
                          }`}
                        >
                          {fila.indicador}
                        </span>
                      )}
                      {fila.estadoRecurso && (
                        <Boton
                          aria-label={`${fila.estadoRecurso.activo ? 'Desactivar' : 'Reactivar'} ${fila.titulo}`}
                          cargando={recursoActualizando === fila.id}
                          onClick={() => void cambiarEstado(fila)}
                          variante="secundario"
                        >
                          {fila.estadoRecurso.activo ? 'Desactivar' : 'Reactivar'}
                        </Boton>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
