CREATE TABLE IF NOT EXISTS map_state (
  map_id     TEXT PRIMARY KEY,
  state      TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);
