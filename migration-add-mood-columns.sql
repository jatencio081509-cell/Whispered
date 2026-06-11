-- Add mood columns to users table for real-time mood sharing
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS mood_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for mood lookups
CREATE INDEX IF NOT EXISTS idx_users_mood ON users(mood);
