-- ─── HUNTERS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hunters (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  playbook     TEXT NOT NULL,
  harm         INTEGER DEFAULT 0,
  harm_max     INTEGER DEFAULT 7,
  stability    INTEGER DEFAULT 7,
  luck         INTEGER DEFAULT 7,
  xp           INTEGER DEFAULT 0,
  xp_threshold INTEGER DEFAULT 5,
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hunter_stats (
  hunter_id TEXT REFERENCES hunters(id),
  stat      TEXT NOT NULL,
  value     INTEGER NOT NULL,
  PRIMARY KEY (hunter_id, stat)
);

CREATE TABLE IF NOT EXISTS hunter_moves (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  move_name TEXT NOT NULL,
  source    TEXT,
  notes     TEXT
);

CREATE TABLE IF NOT EXISTS hunter_bonds (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id   TEXT REFERENCES hunters(id),
  target      TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS hunter_gear (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  name      TEXT NOT NULL,
  tags      TEXT,
  notes     TEXT
);

-- ─── ROLL LOG ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rolls (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_id TEXT REFERENCES hunters(id),
  session   TEXT NOT NULL,
  move_name TEXT NOT NULL,
  stat_used TEXT,
  roll_1    INTEGER NOT NULL,
  roll_2    INTEGER NOT NULL,
  modifier  INTEGER DEFAULT 0,
  total     INTEGER NOT NULL,
  outcome   TEXT NOT NULL,
  note      TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

-- ─── SESSIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  title      TEXT,
  status     TEXT DEFAULT 'upcoming',
  outcome    TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clocks (
  id            TEXT PRIMARY KEY,
  session_id    TEXT REFERENCES sessions(id),
  case_name     TEXT NOT NULL,
  clock_max     INTEGER DEFAULT 6,
  clock_current INTEGER DEFAULT 0,
  notes         TEXT,
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     TEXT REFERENCES sessions(id),
  closed_session TEXT,
  title          TEXT NOT NULL,
  description    TEXT,
  priority       TEXT DEFAULT 'medium',
  tags           TEXT
);

-- ─── NPCS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS npcs (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  name                TEXT NOT NULL,
  affiliation         TEXT,
  status              TEXT DEFAULT 'alive',
  first_seen          TEXT,
  visible_to_players  BOOLEAN DEFAULT false,
  player_notes        TEXT,
  keeper_notes        TEXT,
  updated_at          TEXT DEFAULT (datetime('now'))
);

-- ─── MESSAGES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT REFERENCES sessions(id),
  sender       TEXT NOT NULL,
  recipient    TEXT DEFAULT 'all',
  subject      TEXT,
  body         TEXT NOT NULL,
  delivered    BOOLEAN DEFAULT false,
  delivered_at TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

-- ─── HANDOUTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS handouts (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id         TEXT REFERENCES sessions(id),
  title              TEXT NOT NULL,
  type               TEXT DEFAULT 'text',
  content            TEXT,
  visible_to_players BOOLEAN DEFAULT false,
  revealed_at        TEXT
);

-- ─── AUTH ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS player_tokens (
  token      TEXT PRIMARY KEY,
  hunter_id  TEXT REFERENCES hunters(id),
  created_at TEXT DEFAULT (datetime('now')),
  revoked    BOOLEAN DEFAULT false
);
