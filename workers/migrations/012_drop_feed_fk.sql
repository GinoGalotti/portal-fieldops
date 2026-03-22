-- Migration 012: recreate messages + rolls without legacy FK constraints
-- The legacy schema had messages.session_id → sessions(id) and rolls.hunter_id → hunters(id).
-- Our current code uses free-text keys ('M02', 'reed') that don't exist in those legacy tables,
-- causing FOREIGN KEY constraint failures on every INSERT.

-- ── messages ────────────────────────────────────────────────────────────────
ALTER TABLE messages RENAME TO messages_legacy;

CREATE TABLE messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT,
  sender       TEXT NOT NULL DEFAULT 'CAMPBELL',
  recipient    TEXT DEFAULT 'all',
  subject      TEXT,
  body         TEXT NOT NULL,
  delivered    INTEGER DEFAULT 1,
  delivered_at TEXT DEFAULT (datetime('now')),
  type         TEXT DEFAULT 'message',
  payload      TEXT DEFAULT NULL
);

-- (messages_legacy is empty — no data to migrate)
DROP TABLE messages_legacy;

-- ── rolls ────────────────────────────────────────────────────────────────────
ALTER TABLE rolls RENAME TO rolls_legacy;

CREATE TABLE rolls (
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

-- (rolls_legacy is empty — no data to migrate)
DROP TABLE rolls_legacy;
