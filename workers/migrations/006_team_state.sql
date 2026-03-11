-- Migration 006: team state
-- Stores team playbook state (XP, moves, assets, ally, enemy, notes).
-- Keyed by a free-form key to allow future expansion.

CREATE TABLE IF NOT EXISTS team_state (
  key        TEXT PRIMARY KEY,
  state      TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
