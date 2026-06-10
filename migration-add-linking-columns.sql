-- Add missing columns for linking functionality to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linking_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS partner_code TEXT,
ADD COLUMN IF NOT EXISTS partner_name TEXT,
ADD COLUMN IF NOT EXISTS partner_user_id TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for linking_code lookups
CREATE INDEX IF NOT EXISTS idx_users_linking_code ON users(linking_code);

-- Disable RLS for users table since Clerk handles authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
