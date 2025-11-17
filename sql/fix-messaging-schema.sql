-- Create missing conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (conversation_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);

-- Verify all messaging tables exist
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') as conversations_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversation_participants') as participants_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') as messages_exists;
