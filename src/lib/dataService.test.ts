import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buscarTokenVigentePorHash,
  contarSolicitudesRecientes,
  crearTokenRestablecimiento,
  invalidarTokensPendientes,
  marcarTokenComoUsado,
  registrarSolicitudSiPermitida,
  reservarTokenVigente,
} from './dataService';

const rutaOriginal = process.env.POEMA_PASSWORD_RESETS_FILE;
let directorioTemporal: string | undefined;

afterEach(async () => {
  if (rutaOriginal === undefined) {
    delete process.env.POEMA_PASSWORD_RESETS_FILE;
  } else {
    process.env.POEMA_PASSWORD_RESETS_FILE = rutaOriginal;
  }
  if (directorioTemporal) await rm(directorioTemporal, { recursive: true, force: true });
  directorioTemporal = undefined;
});

describe('persistencia de restablecimientos', () => {
  it('cuenta solicitudes recientes, no devuelve vencidos e invalida pendientes', async () => {
    directorioTemporal = await mkdtemp(path.join(os.tmpdir(), 'poema-resets-'));
    process.env.POEMA_PASSWORD_RESETS_FILE = path.join(directorioTemporal, 'tokens.json');

    expect(await registrarSolicitudSiPermitida('usr_001')).toBe(true);
    expect(await registrarSolicitudSiPermitida('usr_001')).toBe(true);
    await crearTokenRestablecimiento('usr_001', 'hash-vigente', new Date(Date.now() + 60_000));
    await crearTokenRestablecimiento('usr_001', 'hash-vencido', new Date(Date.now() - 60_000));

    expect(await contarSolicitudesRecientes('usr_001')).toBe(2);
    expect(await registrarSolicitudSiPermitida('usr_001')).toBe(true);
    expect(await contarSolicitudesRecientes('usr_001')).toBe(3);
    expect(await registrarSolicitudSiPermitida('usr_001')).toBe(false);
    expect(await buscarTokenVigentePorHash('hash-vigente')).toMatchObject({
      usuarioId: 'usr_001',
      tokenHash: 'hash-vigente',
      usadoEn: null,
    });
    expect(await buscarTokenVigentePorHash('hash-vencido')).toBeUndefined();

    const tokenActual = await buscarTokenVigentePorHash('hash-vigente');
    expect(tokenActual).toBeDefined();
    expect(await reservarTokenVigente(tokenActual!.id)).toBe(true);
    expect(await reservarTokenVigente(tokenActual!.id)).toBe(false);
    expect(await buscarTokenVigentePorHash('hash-vigente')).toBeDefined();
    await marcarTokenComoUsado(tokenActual!.id);
    expect(await buscarTokenVigentePorHash('hash-vigente')).toBeUndefined();

    await invalidarTokensPendientes('usr_001');
    expect(await buscarTokenVigentePorHash('hash-vigente')).toBeUndefined();
    expect(await contarSolicitudesRecientes('usr_001')).toBe(3);
  });
});