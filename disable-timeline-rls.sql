-- Disable Row Level Security for timeline_events table
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read timeline events from their couple" ON timeline_events;
DROP POLICY IF EXISTS "Users can insert timeline events for their couple" ON timeline_events;
DROP POLICY IF EXISTS "Users can delete their own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can update their own timeline events" ON timeline_events;

-- Made with Bob
