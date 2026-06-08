-- Create couples table
CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  user1_id TEXT NOT NULL,
  user2_id TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  official_date TEXT,
  engagement_date TEXT,
  wedding_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_couples_user1_id ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2_id ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_couples_invite_code ON couples(invite_code);
CREATE INDEX IF NOT EXISTS idx_memories_couple_id ON memories(couple_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_couple_id ON messages(couple_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at ASC);

-- Enable Row Level Security
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for couples
CREATE POLICY "Users can view their own couples"
  ON couples FOR SELECT
  USING (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text);

CREATE POLICY "Users can create couples"
  ON couples FOR INSERT
  WITH CHECK (user1_id::text = auth.uid()::text);

CREATE POLICY "Users can update their couples"
  ON couples FOR UPDATE
  USING (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text);

-- Create policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id::text = auth.uid()::text);

-- Create policies for memories
-- Allow users to read memories from their couple
CREATE POLICY "Users can read memories from their couple"
  ON memories FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
  );

-- Allow users to insert memories for their couple
CREATE POLICY "Users can insert memories for their couple"
  ON memories FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
    AND user_id::text = auth.uid()::text
  );

-- Allow users to delete their own memories
CREATE POLICY "Users can delete their own memories"
  ON memories FOR DELETE
  USING (user_id::text = auth.uid()::text);

-- Create policies for messages
-- Allow users to read messages from their couple
CREATE POLICY "Users can read messages from their couple"
  ON messages FOR SELECT
  USING (
    couple_id IN (
      SELECT id FROM couples WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
  );

-- Allow users to insert messages for their couple
CREATE POLICY "Users can insert messages for their couple"
  ON messages FOR INSERT
  WITH CHECK (
    couple_id IN (
      SELECT id FROM couples WHERE user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text
    )
    AND user_id::text = auth.uid()::text
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
