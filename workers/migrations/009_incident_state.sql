-- Per-week incident state (choice answers for choice-type incidents)
CREATE TABLE IF NOT EXISTS incident_state (
  week       TEXT PRIMARY KEY,
  state      TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT
);
