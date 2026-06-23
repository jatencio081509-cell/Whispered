-- Create activity_log table for tracking daily activity
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  couple_id TEXT NOT NULL,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- 'chat', 'mood', 'memory', 'prompt', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, couple_id, activity_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_couple_id ON activity_log(couple_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON activity_log(activity_date DESC);

-- Disable RLS for now (can be enabled later with proper policies)
ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;

-- Made with Bob
