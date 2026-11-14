# Finca Bananera

Aplicación web para administrar trabajadores e inventario de una finca bananera. Está construida con Next.js, TypeScript y PostgreSQL (Supabase).

## Funcionalidades

- Panel de inventario y alertas.
- Creación de usuarios para personas autenticadas.
- Registro y consulta de trabajadores.
- Inventario de implementos y productos químicos.
- Movimientos de entrada y salida para actualizar existencias.
- Validación de cantidades, fechas, stock insuficiente y productos vencidos.

## Requisitos

- Node.js 20.9 o posterior y npm.
- Una base de datos PostgreSQL accesible desde la aplicación.
- Variables de entorno configuradas en `.env.local` para desarrollo local.

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea `.env.local` en la raíz y configura los nombres de variables que necesite tu entorno:

   - `POEMA32_POSTGRES_PRISMA_URL`
   - `POEMA32_POSTGRES_URL_NON_POOLING`
   - `POSTGRES_PRISMA_URL` y `POSTGRES_URL_NON_POOLING` (nombres de la integración de Supabase en Vercel)
   - `AUTH_SECRET`
   - `DEMO_USER_EMAIL` y `DEMO_USER_PASSWORD` (solo para crear la cuenta inicial si la tabla de usuarios está vacía)
   - `RESEND_API_KEY` y `RESEND_FROM` (envío de correos, si se habilita)

   No guardes valores de entorno en Git ni compartas credenciales.

3. Aplica las migraciones, carga los datos de demostración e inicia la aplicación:

   ```bash
   npm run db:migrar
   npm run db:demo
   npm run dev
   ```

4. Abre <http://localhost:3000>.

En desarrollo local, el inicio de sesión ofrece **Crear una cuenta** y registra la cuenta con
sesión iniciada. El registro público está deshabilitado en producción porque cada cuenta tiene
acceso completo al inventario; allí, las personas autorizadas pueden usar **Crear usuario** desde
el panel. En producción, usuarios y restablecimientos se guardan en Postgres; en desarrollo local,
las cuentas y solicitudes de recuperación usan archivos locales. Las contraseñas se almacenan como
hashes, nunca en texto plano.

Los scripts locales de administración de PostgreSQL usan `POEMA32_POSTGRES_URL_NON_POOLING` o
`POSTGRES_URL_NON_POOLING`. La aplicación usa `POEMA32_POSTGRES_PRISMA_URL` o
`POSTGRES_PRISMA_URL` para el pooler en producción.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Compila la aplicación para producción. |
| `npm start` | Inicia el servidor de producción compilado. |
| `npm run lint` | Ejecuta ESLint. |
| `npm test` | Ejecuta las pruebas automatizadas. |
| `npm run db:migrar` | Aplica las migraciones de PostgreSQL. |
| `npm run db:verificar` | Verifica tablas, vistas e integridad de la base. |
| `npm run db:demo` | Recarga los registros de demostración. |
| `npm run db:limpiar -- --prueba` | Elimina registros `Prueba %` y conserva los datos `Demo %`. |
| `npm run probar:flujo` | Ejecuta las pruebas del flujo de finca y limpia solo sus registros de prueba. |

## Inventario y fechas

Las cantidades de químicos se ingresan y presentan en decimales; se almacenan en centésimas para evitar errores de precisión. Las alertas de inventario bajo, próximo a vencer y vencido se calculan a partir de las existencias, cantidades mínimas, vencimientos y fecha actual; no se guardan como estados independientes.

Consulta el [plan funcional y técnico](./doc/PLAN_FINCA.md) para las reglas y criterios de aceptación.
