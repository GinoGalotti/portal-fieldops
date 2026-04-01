-- Migration 017: add outcome_text to rolls table
-- Stores the specific outcome description for the tier that was rolled
-- (e.g. the 7-9 line for a partial, the 10+ line for a hit).
-- NULL for playbook moves that only have a flat description (no structured outcomes).

ALTER TABLE rolls ADD COLUMN outcome_text TEXT DEFAULT NULL;
