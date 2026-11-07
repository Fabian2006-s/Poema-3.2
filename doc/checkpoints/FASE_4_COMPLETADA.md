# Fase 4 completada · Datos y API

- P04: `npm run probar:flujo` completó 15 pasos sin fallas; `npm run db:demo` cargó los registros demostrativos.
- P05: se crearon rutas protegidas para trabajadores, implementos, químicos, movimientos y alertas.

## Verificación local

```text
Sin sesión, GET /api/finca/implementos: 401
Sin sesión, POST /api/finca/movimientos: 401
Con sesión, crear trabajador, implemento y químico: 201
Documento duplicado: 409 DOCUMENTO_DUPLICADO
Salida de implemento y alerta de inventario bajo: 201; alerta presente
Salida de químico de 1,5 litros: 201; saldo final 3,5
Salida superior al inventario: 409 CANTIDAD_INSUFICIENTE
Salida de químico vencido: 409 QUIMICO_VENCIDO
npm run build: correcto
npm test: 10 archivos, 47 pruebas correctas
npx eslint src/app/api/finca src/lib/datos src/lib/http/respuestas.ts: correcto
npm run db:verificar: 0 fallas
```

Los registros temporales de la prueba autenticada se eliminaron mediante una limpieza puntual; los datos demostrativos existentes se conservaron.
