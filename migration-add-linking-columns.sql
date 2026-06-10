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

-- Update RLS policies to allow looking up users by linking_code
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id::text = auth.uid()::text);

-- Allow users to look up other users by linking_code (for linking functionality)
CREATE POLICY "Users can lookup by linking_code"
  ON users FOR SELECT
  USING (linking_code IS NOT NULL);

-- Update insert policy to include new columns
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can upsert their own profile"
  ON users FOR ALL
  USING (id::text = auth.uid()::text)
  WITH CHECK (id::text = auth.uid()::text);
