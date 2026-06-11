-- Update memories table to remove couple_id requirement
-- Make couple_id optional since we now use partner_user_id
ALTER TABLE memories ALTER COLUMN couple_id DROP NOT NULL;

-- Disable RLS for memories table since Clerk handles authentication
ALTER TABLE memories DISABLE ROW LEVEL SECURITY;
