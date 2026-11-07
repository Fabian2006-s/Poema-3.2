-- M1: tablas de la finca bananera

CREATE TABLE IF NOT EXISTS trabajadores (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(120)  NOT NULL,
  documento   VARCHAR(40)   NOT NULL,
  cargo       VARCHAR(80)   NOT NULL,
  telefono    VARCHAR(40),
  estado      VARCHAR(10)   NOT NULL DEFAULT 'activo',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT trab_nombre_minimo    CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT trab_documento_minimo CHECK (char_length(btrim(documento)) >= 1),
  CONSTRAINT trab_estado_valido    CHECK (estado IN ('activo', 'inactivo'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_trab_documento ON trabajadores (lower(btrim(documento)));

CREATE TABLE IF NOT EXISTS implementos (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(120)  NOT NULL,
  categoria       VARCHAR(60)   NOT NULL,
  disponible      INTEGER       NOT NULL DEFAULT 0,
  minima          INTEGER       NOT NULL DEFAULT 0,
  inactivo        BOOLEAN       NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT impl_nombre_minimo  CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT impl_disp_no_neg    CHECK (disponible >= 0),
  CONSTRAINT impl_minima_no_neg  CHECK (minima >= 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_impl_nombre ON implementos (lower(btrim(nombre)));

CREATE TABLE IF NOT EXISTS quimicos (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             VARCHAR(120)  NOT NULL,
  categoria          VARCHAR(60)   NOT NULL,
  disponible_cent    INTEGER       NOT NULL DEFAULT 0,
  minima_cent        INTEGER       NOT NULL DEFAULT 0,
  unidad             VARCHAR(20)   NOT NULL,
  fecha_vencimiento  DATE          NOT NULL,
  inactivo           BOOLEAN       NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT quim_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),
  CONSTRAINT quim_disp_no_neg   CHECK (disponible_cent >= 0),
  CONSTRAINT quim_minima_no_neg CHECK (minima_cent >= 0),
  CONSTRAINT quim_unidad_minima CHECK (char_length(btrim(unidad)) >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_quim_nombre ON quimicos (lower(btrim(nombre)));
CREATE INDEX IF NOT EXISTS idx_quim_vencimiento ON quimicos (fecha_vencimiento);

CREATE TABLE IF NOT EXISTS movimientos (
  id            BIGSERIAL     PRIMARY KEY,
  tipo_elemento VARCHAR(10)   NOT NULL,
  elemento_id   UUID          NOT NULL,
  tipo          VARCHAR(8)    NOT NULL,
  cantidad_cent INTEGER       NOT NULL,
  motivo        VARCHAR(200)  NOT NULL,
  fecha         DATE          NOT NULL,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT mov_tipo_elemento_valido CHECK (tipo_elemento IN ('implemento', 'quimico')),
  CONSTRAINT mov_tipo_valido          CHECK (tipo IN ('entrada', 'salida')),
  CONSTRAINT mov_cantidad_positiva    CHECK (cantidad_cent > 0),
  CONSTRAINT mov_motivo_minimo        CHECK (char_length(btrim(motivo)) >= 1)
);
CREATE INDEX IF NOT EXISTS idx_mov_elemento ON movimientos (tipo_elemento, elemento_id, fecha DESC);

CREATE TABLE IF NOT EXISTS asignaciones (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajador_id  UUID          NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  implemento_id  UUID          NOT NULL REFERENCES implementos(id) ON DELETE RESTRICT,
  cantidad       INTEGER       NOT NULL,
  fecha          DATE          NOT NULL,
  estado         VARCHAR(10)   NOT NULL DEFAULT 'entregado',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT asig_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT asig_estado_valido     CHECK (estado IN ('entregado', 'devuelto'))
);
CREATE INDEX IF NOT EXISTS idx_asig_trabajador ON asignaciones (trabajador_id, estado);
CREATE INDEX IF NOT EXISTS idx_asig_implemento ON asignaciones (implemento_id);

CREATE OR REPLACE FUNCTION finca_actualizar_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_impl_updated_at ON implementos;
CREATE TRIGGER trg_impl_updated_at BEFORE UPDATE ON implementos
  FOR EACH ROW EXECUTE FUNCTION finca_actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_quim_updated_at ON quimicos;
CREATE TRIGGER trg_quim_updated_at BEFORE UPDATE ON quimicos
  FOR EACH ROW EXECUTE FUNCTION finca_actualizar_updated_at();
