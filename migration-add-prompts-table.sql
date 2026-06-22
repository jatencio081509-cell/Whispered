-- Create prompts table for daily prompts with partner sync
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  prompt TEXT NOT NULL,
  user1_id TEXT NOT NULL, -- First user (creator)
  user2_id TEXT, -- Second user (partner)
  user1_answer TEXT,
  user2_answer TEXT,
  revealed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_date ON prompts(date);
CREATE INDEX IF NOT EXISTS idx_prompts_user1_id ON prompts(user1_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user2_id ON prompts(user2_id);

-- Disable RLS - we handle security filtering in the app code
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompts_updated_at();
