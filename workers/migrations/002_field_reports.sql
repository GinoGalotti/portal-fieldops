-- Migration 002: keeper field reports
-- One row per session. Updated in-place on every save.

CREATE TABLE IF NOT EXISTS field_reports (
  session_id TEXT PRIMARY KEY,   -- 'S01' | 'S02' etc
  state      TEXT NOT NULL,      -- JSON blob (see report.html data model)
  updated_at TEXT DEFAULT (datetime('now'))
);
