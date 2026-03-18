CREATE TABLE IF NOT EXISTS dossier_state (
  dossier_id TEXT PRIMARY KEY,
  state      TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);
