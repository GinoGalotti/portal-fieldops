-- Migration 007: feed tables (rolls + messages)
-- Rolls: every move roll logged during a session
CREATE TABLE IF NOT EXISTS rolls (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT,
  session     TEXT,
  move_name   TEXT NOT NULL,
  stat_used   TEXT,
  roll_1      INTEGER,
  roll_2      INTEGER,
  modifier    INTEGER DEFAULT 0,
  total       INTEGER,
  outcome     TEXT,
  note        TEXT,
  rolled_at   TEXT DEFAULT (datetime('now'))
);

-- Messages: CAMPBELL / Director messages delivered to operatives
CREATE TABLE IF NOT EXISTS messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT,
  sender       TEXT DEFAULT 'CAMPBELL',
  recipient    TEXT DEFAULT 'all',
  subject      TEXT,
  body         TEXT NOT NULL,
  delivered    INTEGER DEFAULT 1,
  delivered_at TEXT DEFAULT (datetime('now'))
);
