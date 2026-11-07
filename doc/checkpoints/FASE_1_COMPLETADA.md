# Fase 1 completada · Base de datos

## Migraciones

Se aplicaron correctamente:

- `001_finca_base.sql`
- `002_finca_vistas_seguridad.sql`

Los scripts administrativos usan `POEMA32_POSTGRES_URL_NON_POOLING` (puerto 5432); la aplicación debe usar el pooler `POEMA32_POSTGRES_PRISMA_URL` (puerto 6543). Se elimina `sslmode` del URL administrativo para que `pg` respete la configuración TLS explícita.

## Verificación de base de datos

```text
Conexión a Postgres: OK
OK Existe trabajadores
OK Existe implementos
OK Existe quimicos
OK Existe movimientos
OK Existe asignaciones
OK Existe v_implementos
OK Existe v_quimicos
Filas trabajadores: 0
Filas implementos: 0
Filas quimicos: 0
Filas movimientos: 0
Filas asignaciones: 0
OK Existe índice ux_trab_documento
OK Existe índice ux_impl_nombre
OK Existe índice ux_quim_nombre
OK Existe restricción impl_disp_no_neg
OK Existe restricción quim_disp_no_neg
OK Existe restricción mov_cantidad_positiva
OK Existe restricción mov_motivo_minimo
OK RLS trabajadores: activo
OK RLS implementos: activo
OK RLS quimicos: activo
OK RLS movimientos: activo
OK RLS asignaciones: activo
OK a) trabajador y documento VD-1 único
OK b) disponible negativo de implemento
OK c) disponible_cent negativo de químico
OK d) movimiento con cantidad_cent cero
OK e) movimiento con motivo vacío
OK f) movimiento con tipo_elemento 'vehiculo'
OK g) trabajador con estado 'suspendido'
OK h) inventario 5 con mínima 5 activa alerta de bajo
Transacción de integridad: ROLLBACK (siempre)
Total de fallas: 0
```

`npm run build` pasa. La suite existente de línea base también pasa: 6 archivos, 13 pruebas.
