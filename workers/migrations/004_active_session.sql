-- active_session: stores the keeper-set global session for all player-facing pages.
-- The keeper updates this via the session toggle widget on any keeper page.
-- Players fetch GET /api/v1/session/active on page load to determine which content to render.
-- Single row keyed by id = 'global'.

CREATE TABLE IF NOT EXISTS active_session (
  id         TEXT PRIMARY KEY DEFAULT 'global',  -- always 'global'
  session_id TEXT NOT NULL DEFAULT 'w2',          -- active session id: 'w1', 'w2', etc.
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Seed with w2 (S01 resolved, S02 active — current campaign state)
INSERT OR IGNORE INTO active_session (id, session_id) VALUES ('global', 'w2');
