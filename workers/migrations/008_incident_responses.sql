-- Incident 02 text responses (The Bálint Question)
-- Also usable for future open-response incidents
CREATE TABLE IF NOT EXISTS incident_responses (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id  TEXT NOT NULL,
  hunter_name  TEXT NOT NULL DEFAULT 'Anonymous',
  response_text TEXT NOT NULL,
  submitted_at TEXT NOT NULL
);
