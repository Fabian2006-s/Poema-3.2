# Fase 5 completada · Interfaz

- P06: panel de alertas y gestión de trabajadores.
- P07: consulta y registro de implementos y químicos.
- P08: formulario de movimientos en `/finca/movimientos/nuevo`, con selección de elemento activo, tipo de movimiento, cantidad, fecha y motivo.
- El formulario valida cantidades enteras para implementos y admite decimales para químicos; presenta el nuevo saldo, el estado y la alerta de inventario bajo.
- Las tablas de inventario muestran existencias y estados; la tabla de químicos incluye unidades y vencimientos.

## Verificación local

- Entrada y salida de implementos; salida de 2 unidades dejó 3 y mostró la alerta de inventario bajo.
- Salida de 1,5 litros dejó 1 litro; fecha mostrada en formato `DD/MM/AAAA`.
- La interfaz rechazó cantidades fraccionarias para implementos, stock insuficiente y salida de un químico vencido.
- A 375 px de ancho no hubo desbordamiento horizontal.
- `npm run build`: correcto.
