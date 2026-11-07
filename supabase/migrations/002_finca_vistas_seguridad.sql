-- M2: vistas con estado y alertas derivados, y cierre de acceso público

CREATE OR REPLACE VIEW v_implementos
WITH (security_invoker = true) AS
SELECT i.*,
  CASE WHEN i.inactivo THEN 'inactivo'
       WHEN i.disponible <= 0 THEN 'agotado'
       ELSE 'disponible' END AS estado,
  (i.disponible <= i.minima) AS inventario_bajo
FROM implementos i;

CREATE OR REPLACE VIEW v_quimicos
WITH (security_invoker = true) AS
SELECT q.*,
  CASE WHEN q.inactivo THEN 'inactivo'
       WHEN q.fecha_vencimiento < CURRENT_DATE THEN 'vencido'
       WHEN q.disponible_cent <= 0 THEN 'agotado'
       ELSE 'disponible' END AS estado,
  (q.disponible_cent <= q.minima_cent) AS inventario_bajo
FROM quimicos q;

ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quimicos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON trabajadores, implementos, quimicos, movimientos, asignaciones FROM anon, authenticated;
REVOKE ALL ON v_implementos, v_quimicos FROM anon, authenticated;
