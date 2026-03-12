-- Migration 010: add type + payload columns to messages
-- type:    'message' (default chat/CAMPBELL) | 'readaloud' | 'pda' | 'image' | 'map'
-- payload: JSON blob with extra fields per type (image src, pda from/subject/body, readaloud label/text)
ALTER TABLE messages ADD COLUMN type    TEXT DEFAULT 'message';
ALTER TABLE messages ADD COLUMN payload TEXT DEFAULT NULL;
