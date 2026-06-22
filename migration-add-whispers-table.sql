-- Create whispers table for hidden messages with partner sync
CREATE TABLE IF NOT EXISTS whispers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  reveal_condition TEXT NOT NULL, -- time_delay, both_online, streak_milestone, anniversary, prompt_complete
  reveal_value TEXT, -- Value for the condition (e.g., "7 days", "30", "Jun 15, 2025")
  user1_id TEXT NOT NULL, -- Creator
  user2_id TEXT, -- Partner
  revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revealed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_whispers_user1_id ON whispers(user1_id);
CREATE INDEX IF NOT EXISTS idx_whispers_user2_id ON whispers(user2_id);
CREATE INDEX IF NOT EXISTS idx_whispers_revealed ON whispers(revealed);

-- Disable RLS - we handle security filtering in the app code
ALTER TABLE whispers DISABLE ROW LEVEL SECURITY;
