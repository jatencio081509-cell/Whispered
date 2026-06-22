-- Drop existing goals table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS goals CASCADE;

-- Create shared goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  frequency TEXT DEFAULT 'one-time' CHECK (frequency IN ('one-time', 'daily', 'yearly')),
  is_shared BOOLEAN DEFAULT FALSE,
  user_progress JSONB DEFAULT '{}'::jsonb,
  last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_goals_couple_id ON goals(couple_id);
CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at DESC);

-- Disable RLS - we handle security filtering in the app code
ALTER TABLE goals DISABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
