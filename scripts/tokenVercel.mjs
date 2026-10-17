import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

const archivoTemporal = '.env.vercel.local';
const archivoEntorno = '.env.local';
const aviso = 'Aviso: no se pudo renovar la conexión con Vercel. El envío de correos no funcionará en local.';

try {
  execSync('npx vercel env pull .env.vercel.local --yes', { stdio: 'ignore' });

  const contenidoTemporal = readFileSync(archivoTemporal, 'utf8');
  const lineaToken = contenidoTemporal.match(/^\s*VERCEL_OIDC_TOKEN\s*=\s*(.+?)\s*$/m)?.[1];
  if (!lineaToken || !existsSync(archivoEntorno)) throw new Error('Falta el token o .env.local.');

  const contenidoEntorno = readFileSync(archivoEntorno, 'utf8');
  const salto = contenidoEntorno.includes('\r\n') ? '\r\n' : '\n';
  const terminaEnSalto = /\r?\n$/.test(contenidoEntorno);
  const lineas = contenidoEntorno.split(/\r?\n/);
  if (terminaEnSalto) lineas.pop();

  const indiceToken = lineas.findIndex((linea) => /^\s*VERCEL_OIDC_TOKEN\s*=/.test(linea));
  if (indiceToken >= 0) {
    lineas[indiceToken] = `VERCEL_OIDC_TOKEN=${lineaToken}`;
  } else {
    lineas.push(`VERCEL_OIDC_TOKEN=${lineaToken}`);
  }

  const nuevoContenido = lineas.join(salto) + (terminaEnSalto || indiceToken < 0 ? salto : '');
  writeFileSync(archivoEntorno, nuevoContenido, 'utf8');
} catch {
  console.warn(aviso);
} finally {
  if (existsSync(archivoTemporal)) unlinkSync(archivoTemporal);
}