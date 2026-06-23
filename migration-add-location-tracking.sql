-- Add location tracking columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manual_address TEXT;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_users_location_updated_at ON users(location_updated_at DESC);