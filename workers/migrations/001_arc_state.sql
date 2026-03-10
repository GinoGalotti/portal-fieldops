-- Migration 001: hunter arc state
-- Stores the full arc page state (choices, beats, resolution, text) as a JSON blob.
-- One row per hunter. Updated in-place on every save.

CREATE TABLE IF NOT EXISTS hunter_arc_state (
  hunter_id  TEXT PRIMARY KEY,
  state      TEXT NOT NULL,           -- JSON blob matching hunter.js data model
  updated_at TEXT DEFAULT (datetime('now'))
);
