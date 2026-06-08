-- Add date columns to couples table
ALTER TABLE couples ADD COLUMN IF NOT EXISTS official_date TEXT;
ALTER TABLE couples ADD COLUMN IF NOT EXISTS engagement_date TEXT;
ALTER TABLE couples ADD COLUMN IF NOT EXISTS wedding_date TEXT;
