-- Migration 003: player session feedback
-- One row per hunter per week. Updated in-place on every save.

CREATE TABLE IF NOT EXISTS player_reports (
  week       TEXT NOT NULL,   -- 'W01' | 'W02' etc
  hunter_id  TEXT NOT NULL,   -- 'alan' | 'reed' | 'rex' | 'sven' | 'john'
  state      TEXT NOT NULL,   -- JSON blob (see reports/player-report.html data model)
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (week, hunter_id)
);
