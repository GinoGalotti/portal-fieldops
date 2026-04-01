-- Migration 016: add created_at timestamp to rolls table
-- Existing rows get NULL (they pre-date this migration).
-- fix_roll_timestamps.py backfills them from transcript keyword matching
-- or linear interpolation across the session window.

ALTER TABLE rolls ADD COLUMN created_at TEXT DEFAULT NULL;
