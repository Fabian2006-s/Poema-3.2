# Fase 1 bloqueada · Base de datos

Se implementaron las migraciones M1/M2 y los comandos `db:migrar` y `db:verificar`. El build y la sintaxis de los scripts pasan.

La conexión a las dos URLs pooler configuradas permite abrir TCP en el puerto 6543, pero la sesión de PostgreSQL termina con `ECONNRESET`/timeout. Por ello no se pudo confirmar la aplicación de las migraciones ni ejecutar las pruebas de integridad; el estado remoto del esquema es desconocido.

No ejecutar P02 hasta que `npm run db:migrar` y `npm run db:verificar` completen correctamente.
