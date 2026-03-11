-- Migration 005: hunter sheet state
-- Per-hunter playbook fields (stats, harm, luck, xp, moves, gear, bonds, notes, special)
-- stored as a JSON blob. Same pattern as hunter_arc_state.

CREATE TABLE IF NOT EXISTS hunter_sheets (
  hunter_id  TEXT PRIMARY KEY,
  state      TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
