-- Create reactions table for memories
CREATE TABLE IF NOT EXISTS reactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  memory_id TEXT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(memory_id, user_id, emoji)
);

-- Disable RLS for reactions (for development)
ALTER TABLE reactions DISABLE ROW LEVEL SECURITY;

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE reactions;
