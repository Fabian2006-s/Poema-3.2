'use client';

import { useState, type FormEvent } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';

type RespuestaApi = {
  error?: { mensaje?: string };
};

export function FormularioUsuario() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [creado, setCreado] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setCreado('');
    setGuardando(true);

    try {
      const respuesta = await fetch('/api/auth/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo, password: contrasena }),
      });
      const cuerpo = (await respuesta.json()) as RespuestaApi;
      if (!respuesta.ok) {
        setError(cuerpo.error?.mensaje ?? 'No se pudo crear el usuario.');
        return;
      }

      setCreado(`La cuenta ${correo.trim().toLowerCase()} quedó creada.`);
      setCorreo('');
      setContrasena('');
    } catch {
      setError('No se pudo conectar. Inténtalo de nuevo.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Aviso tipo="advertencia">
        Cada usuario puede administrar trabajadores e inventario. Crea cuentas solo para personas de
        confianza y comparte la contraseña de forma segura.
      </Aviso>
      {error && <Aviso tipo="error">{error}</Aviso>}
      {creado && <Aviso tipo="exito">{creado}</Aviso>}
      <form
        className="grid max-w-xl gap-4 rounded-lg border border-borde bg-superficie p-5"
        onSubmit={crear}
      >
        <Campo
          autoComplete="email"
          etiqueta="Correo electrónico"
          id="nuevo-correo"
          onChange={(evento) => setCorreo(evento.target.value)}
          required
          type="email"
          value={correo}
        />
        <Campo
          autoComplete="new-password"
          etiqueta="Contraseña inicial"
          id="nueva-contrasena"
          minLength={8}
          maxLength={128}
          onChange={(evento) => setContrasena(evento.target.value)}
          required
          type="password"
          value={contrasena}
        />
        <p className="-mt-2 text-sm text-texto-suave">
          Usa entre 8 y 128 caracteres. El usuario podrá cambiarla después de iniciar sesión.
        </p>
        <div>
          <Boton cargando={guardando} type="submit">
            Crear usuario
          </Boton>
        </div>
      </form>
    </div>
  );
}
