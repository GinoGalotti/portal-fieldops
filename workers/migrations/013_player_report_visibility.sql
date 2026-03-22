CREATE TABLE IF NOT EXISTS player_report_visibility (
  week       TEXT PRIMARY KEY,
  enabled    INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT
);
