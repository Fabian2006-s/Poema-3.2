# Fase 6 completada · Revisión y aceptación

- Revisadas las reglas de cantidades, fechas, estados derivados, alertas, validación de motivo y fecha, autenticación de rutas y SQL parametrizado.
- El registro de movimientos actualiza el inventario e inserta el movimiento dentro de una transacción; las salidas de químicos vencidos se rechazan.
- Los químicos se operan en decimales y se almacenan en centésimas. Existencias y alertas se derivan de los datos vigentes.
- Se centralizaron `hoyBogota` y el desplazamiento de fechas en `src/lib/reglas/fechas.ts`.
- Se agregó el modo `--prueba` a la limpieza para eliminar registros de prueba sin tocar los datos demo; `probar:flujo` usa este modo.
- `.env.local` está ignorado y no se encontraron asignaciones de variables de entorno en los archivos versionados.
- `doc/ACEPTACION.md` contiene A-01 a A-18 con las columnas de resultado, evidencia y observación vacías; A-15 a A-18 se reservan para P09.

## Verificación

```text
npm test: 11 archivos, 50 pruebas correctas
npm run probar:flujo: 15 casos correctos, 0 fallas
npm run db:verificar: 0 fallas; datos demo conservados
npm run build: correcto; permanecen dos advertencias preexistentes de trazado dinámico
```

Los casos A-01 a A-14 quedan pendientes de ejecución en el despliegue de Vercel.
