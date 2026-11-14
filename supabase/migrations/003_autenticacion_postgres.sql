-- M3: usuarios del login y restablecimientos persistidos en Postgres

CREATE TABLE IF NOT EXISTS usuarios_login (
  id           TEXT          PRIMARY KEY,
  email        TEXT          NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT usr_login_id_minimo CHECK (char_length(btrim(id)) >= 1),
  CONSTRAINT usr_login_email_minimo CHECK (char_length(btrim(email)) >= 3),
  CONSTRAINT usr_login_hash_minimo CHECK (char_length(btrim(password_hash)) >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_login_email
  ON usuarios_login (lower(btrim(email)));

CREATE TABLE IF NOT EXISTS tokens_recuperacion (
  id                 TEXT          PRIMARY KEY,
  usuario_id         TEXT          NOT NULL REFERENCES usuarios_login(id) ON DELETE CASCADE,
  token_hash         TEXT          NOT NULL,
  expira_en          TIMESTAMPTZ   NOT NULL,
  usado_en           TIMESTAMPTZ,
  reserva_expira_en  TIMESTAMPTZ,
  creado_en          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT token_rec_hash_minimo CHECK (char_length(btrim(token_hash)) >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_tokens_recuperacion_hash
  ON tokens_recuperacion (token_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacion_usuario
  ON tokens_recuperacion (usuario_id, creado_en DESC);

CREATE TABLE IF NOT EXISTS solicitudes_recuperacion (
  id          TEXT          PRIMARY KEY,
  usuario_id  TEXT          NOT NULL REFERENCES usuarios_login(id) ON DELETE CASCADE,
  creado_en   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_solicitudes_recuperacion_usuario
  ON solicitudes_recuperacion (usuario_id, creado_en DESC);

ALTER TABLE usuarios_login ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_recuperacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_recuperacion ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON usuarios_login, tokens_recuperacion, solicitudes_recuperacion
  FROM anon, authenticated;
