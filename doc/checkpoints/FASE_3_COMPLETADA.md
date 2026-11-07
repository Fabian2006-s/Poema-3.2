# Fase 3 completada · Infraestructura del servidor

- Se reutilizó el login existente, envolviendo la sesión firmada con `obtenerSesion()` y `exigirSesion()`.
- `src/proxy.ts` protege `/finca/*` y `/api/finca/*`; Proxy verifica presencia de cookie para redirección temprana, mientras que las rutas validan la cookie firmada con `exigirSesion()`.
- Se agregaron conexión `pg`, manejo uniforme de respuestas sin caché, esquemas Zod, utilidades de formato y `GET /api/finca/sesion`.
- El login y `/` conducen al área `/finca`.

## Verificación local

```text
npm run build: correcto
npm test: 10 archivos, 47 pruebas correctas
ESLint enfocado: correcto
Sin sesión, GET /api/finca/sesion: 401, Cache-Control: no-store
Sin sesión, GET /finca: 307 a /login
Con sesión de desarrollo, POST /api/auth/login: 200
Con sesión, GET /api/finca/sesion: 200
```

La aplicación en serverless usa `POEMA32_POSTGRES_PRISMA_URL`, validando el pooler en el puerto 6543 y retirando el parámetro `sslmode` para que `pg` aplique la configuración TLS explícita.
