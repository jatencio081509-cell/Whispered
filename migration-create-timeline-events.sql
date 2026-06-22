-- Create timeline_events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  couple_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timeline_events_couple_id ON timeline_events(couple_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_event_date ON timeline_events(event_date DESC);

-- Enable Row Level Security
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policies for timeline_events
-- Allow users to read timeline events from their couple
CREATE POLICY "Users can read timeline events from their couple"
  ON timeline_events FOR SELECT
  USING (
    couple_id IN (
      SELECT CONCAT(LEAST(user1_id, user2_id), '-', GREATEST(user1_id, user2_id))
      FROM couples 
      WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
  );

-- Allow users to insert timeline events for their couple
CREATE POLICY "Users can insert timeline events for their couple"
  ON timeline_events FOR INSERT
  WITH CHECK (
    user_id::text = auth.uid()::text
    AND couple_id IN (
      SELECT CONCAT(LEAST(user1_id, user2_id), '-', GREATEST(user1_id, user2_id))
      FROM couples 
      WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
  );

-- Allow users to delete their own timeline events
CREATE POLICY "Users can delete their own timeline events"
  ON timeline_events FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- Allow users to update their own timeline events
CREATE POLICY "Users can update their own timeline events"
  ON timeline_events FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Enable realtime for timeline_events
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_events;

-- Made with Bob
