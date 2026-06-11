-- Update messages table to support direct user-to-user messaging
-- Add columns needed for chat functionality
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS from_user_id TEXT,
ADD COLUMN IF NOT EXISTS to_user_id TEXT,
ADD COLUMN IF NOT EXISTS text TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_from_user_id ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user_id ON messages(to_user_id);

-- Disable RLS for messages table since Clerk handles authentication
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
