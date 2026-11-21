CREATE TABLE IF NOT EXISTS parcelas (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(120)  NOT NULL,
  area_ha     NUMERIC(10, 2),
  activa      BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT parcelas_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT parcelas_area_positiva CHECK (area_ha IS NULL OR area_ha > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_parcelas_nombre ON parcelas (lower(btrim(nombre)));

CREATE TABLE IF NOT EXISTS asistencias (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajador_id        UUID          NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  fecha                DATE          NOT NULL,
  estado               VARCHAR(12)   NOT NULL,
  minutos_trabajados   INTEGER       NOT NULL DEFAULT 0,
  observacion          VARCHAR(300),
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT asistencia_estado_valido CHECK (estado IN ('asistio', 'falta', 'permiso', 'incapacidad')),
  CONSTRAINT asistencia_minutos_validos CHECK (minutos_trabajados BETWEEN 0 AND 1440),
  CONSTRAINT asistencia_horas_estado CHECK (estado = 'asistio' OR minutos_trabajados = 0),
  CONSTRAINT asistencia_observacion_minima CHECK (observacion IS NULL OR char_length(btrim(observacion)) >= 1),
  CONSTRAINT asistencia_trabajador_fecha_unica UNIQUE (trabajador_id, fecha)
);
CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias (fecha DESC);

CREATE TABLE IF NOT EXISTS producciones (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id     UUID          NOT NULL REFERENCES parcelas(id) ON DELETE RESTRICT,
  fecha          DATE          NOT NULL,
  racimos        INTEGER       NOT NULL,
  cajas          INTEGER       NOT NULL DEFAULT 0,
  observacion    VARCHAR(300),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT produccion_racimos_positivos CHECK (racimos > 0),
  CONSTRAINT produccion_cajas_no_negativas CHECK (cajas >= 0),
  CONSTRAINT produccion_observacion_minima CHECK (observacion IS NULL OR char_length(btrim(observacion)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_producciones_fecha ON producciones (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_producciones_parcela ON producciones (parcela_id, fecha DESC);

CREATE TABLE IF NOT EXISTS riegos (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id         UUID          NOT NULL REFERENCES parcelas(id) ON DELETE RESTRICT,
  fecha              DATE          NOT NULL,
  metodo             VARCHAR(80)   NOT NULL,
  duracion_minutos   INTEGER       NOT NULL,
  volumen_m3_cent    INTEGER       NOT NULL,
  observacion        VARCHAR(300),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT riego_metodo_minimo CHECK (char_length(btrim(metodo)) >= 1),
  CONSTRAINT riego_duracion_valida CHECK (duracion_minutos BETWEEN 1 AND 1440),
  CONSTRAINT riego_volumen_no_negativo CHECK (volumen_m3_cent >= 0),
  CONSTRAINT riego_observacion_minima CHECK (observacion IS NULL OR char_length(btrim(observacion)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_riegos_fecha ON riegos (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_riegos_parcela ON riegos (parcela_id, fecha DESC);

CREATE TABLE IF NOT EXISTS maquinaria (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            VARCHAR(120)  NOT NULL,
  tipo              VARCHAR(80)   NOT NULL,
  identificador     VARCHAR(80),
  unidad_medidor    VARCHAR(8)    NOT NULL,
  activa            BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT maquinaria_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT maquinaria_tipo_minimo CHECK (char_length(btrim(tipo)) >= 1),
  CONSTRAINT maquinaria_unidad_valida CHECK (unidad_medidor IN ('horas', 'km')),
  CONSTRAINT maquinaria_identificador_minimo CHECK (identificador IS NULL OR char_length(btrim(identificador)) >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_maquinaria_identificador
  ON maquinaria (lower(btrim(identificador))) WHERE identificador IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_maquinaria_nombre ON maquinaria (lower(btrim(nombre)));
CREATE INDEX IF NOT EXISTS idx_maquinaria_activa ON maquinaria (activa, nombre);

CREATE TABLE IF NOT EXISTS registros_maquinaria (
  id                         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  maquinaria_id              UUID          NOT NULL REFERENCES maquinaria(id) ON DELETE RESTRICT,
  fecha                      DATE          NOT NULL,
  tipo                       VARCHAR(14)   NOT NULL,
  lectura_cent               INTEGER,
  proxima_lectura_cent       INTEGER,
  costo_cop                  INTEGER       NOT NULL DEFAULT 0,
  detalle                    VARCHAR(300)  NOT NULL,
  created_at                 TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT maquinaria_registro_tipo_valido CHECK (tipo IN ('uso', 'mantenimiento')),
  CONSTRAINT maquinaria_lectura_no_negativa CHECK (lectura_cent IS NULL OR lectura_cent >= 0),
  CONSTRAINT maquinaria_proxima_lectura_no_negativa CHECK (proxima_lectura_cent IS NULL OR proxima_lectura_cent >= 0),
  CONSTRAINT maquinaria_costo_no_negativo CHECK (costo_cop >= 0),
  CONSTRAINT maquinaria_detalle_minimo CHECK (char_length(btrim(detalle)) >= 1),
  CONSTRAINT maquinaria_registro_uso_valido CHECK (tipo <> 'uso' OR lectura_cent IS NOT NULL),
  CONSTRAINT maquinaria_proximo_servicio_valido CHECK (
    proxima_lectura_cent IS NULL OR lectura_cent IS NULL OR proxima_lectura_cent > lectura_cent
  )
);
CREATE INDEX IF NOT EXISTS idx_registros_maquinaria_fecha ON registros_maquinaria (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_registros_maquinaria_equipo ON registros_maquinaria (maquinaria_id, fecha DESC);

CREATE TABLE IF NOT EXISTS empaques (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id     UUID          NOT NULL REFERENCES parcelas(id) ON DELETE RESTRICT,
  fecha          DATE          NOT NULL,
  cajas          INTEGER       NOT NULL,
  rechazos       INTEGER       NOT NULL DEFAULT 0,
  observacion    VARCHAR(300),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT empaque_cajas_positivas CHECK (cajas > 0),
  CONSTRAINT empaque_rechazos_no_negativos CHECK (rechazos >= 0),
  CONSTRAINT empaque_observacion_minima CHECK (observacion IS NULL OR char_length(btrim(observacion)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_empaques_fecha ON empaques (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_empaques_parcela ON empaques (parcela_id, fecha DESC);

CREATE TABLE IF NOT EXISTS ventas (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id        UUID          NOT NULL REFERENCES parcelas(id) ON DELETE RESTRICT,
  fecha             DATE          NOT NULL,
  cliente           VARCHAR(120)  NOT NULL,
  cajas             INTEGER       NOT NULL,
  valor_cop         INTEGER       NOT NULL,
  remision          VARCHAR(80),
  observacion       VARCHAR(300),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT venta_cliente_minimo CHECK (char_length(btrim(cliente)) >= 1),
  CONSTRAINT venta_cajas_positivas CHECK (cajas > 0),
  CONSTRAINT venta_valor_positivo CHECK (valor_cop > 0),
  CONSTRAINT venta_remision_minima CHECK (remision IS NULL OR char_length(btrim(remision)) >= 1),
  CONSTRAINT venta_observacion_minima CHECK (observacion IS NULL OR char_length(btrim(observacion)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas (lower(btrim(cliente)));
CREATE INDEX IF NOT EXISTS idx_ventas_parcela ON ventas (parcela_id, fecha DESC);

CREATE TABLE IF NOT EXISTS gastos (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha             DATE          NOT NULL,
  categoria         VARCHAR(60)   NOT NULL,
  descripcion       VARCHAR(200)  NOT NULL,
  valor_cop         INTEGER       NOT NULL,
  forma_pago        VARCHAR(40),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT gasto_categoria_minima CHECK (char_length(btrim(categoria)) >= 1),
  CONSTRAINT gasto_descripcion_minima CHECK (char_length(btrim(descripcion)) >= 1),
  CONSTRAINT gasto_valor_positivo CHECK (valor_cop > 0),
  CONSTRAINT gasto_forma_pago_minima CHECK (forma_pago IS NULL OR char_length(btrim(forma_pago)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos (categoria, fecha DESC);

CREATE TABLE IF NOT EXISTS materiales_empaque (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         VARCHAR(120)  NOT NULL,
  unidad         VARCHAR(30)   NOT NULL,
  disponible     INTEGER       NOT NULL DEFAULT 0,
  minima         INTEGER       NOT NULL DEFAULT 0,
  activo         BOOLEAN       NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT material_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT material_unidad_minima CHECK (char_length(btrim(unidad)) >= 1),
  CONSTRAINT material_disponible_no_negativo CHECK (disponible >= 0),
  CONSTRAINT material_minima_no_negativa CHECK (minima >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_materiales_empaque_nombre
  ON materiales_empaque (lower(btrim(nombre)));

CREATE TABLE IF NOT EXISTS movimientos_materiales (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id    UUID          NOT NULL REFERENCES materiales_empaque(id) ON DELETE RESTRICT,
  tipo           VARCHAR(8)    NOT NULL,
  cantidad       INTEGER       NOT NULL,
  motivo         VARCHAR(200)  NOT NULL,
  fecha          DATE          NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT movimiento_material_tipo_valido CHECK (tipo IN ('entrada', 'salida')),
  CONSTRAINT movimiento_material_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT movimiento_material_motivo_minimo CHECK (char_length(btrim(motivo)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_movimientos_materiales_fecha ON movimientos_materiales (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_materiales_material ON movimientos_materiales (material_id, fecha DESC);

DROP TRIGGER IF EXISTS trg_materiales_empaque_updated_at ON materiales_empaque;
CREATE TRIGGER trg_materiales_empaque_updated_at BEFORE UPDATE ON materiales_empaque
  FOR EACH ROW EXECUTE FUNCTION finca_actualizar_updated_at();

ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE producciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE riegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE maquinaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_maquinaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE empaques ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales_empaque ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_materiales ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON parcelas, asistencias, producciones, riegos, maquinaria,
  registros_maquinaria, empaques, ventas, gastos, materiales_empaque,
  movimientos_materiales FROM anon, authenticated;
