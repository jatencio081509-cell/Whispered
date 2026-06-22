-- Add couple_id to timeline_events table for better partner syncing
ALTER TABLE timeline_events ADD COLUMN IF NOT EXISTS couple_id TEXT;

-- Create index for couple_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_timeline_couple_id ON timeline_events(couple_id);

-- Update existing events to include couple_id based on user partnerships
-- This will need to be run after users have linked their partners
-- The application will handle setting couple_id for new events
