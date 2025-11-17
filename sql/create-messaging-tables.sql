-- ============================================
-- CREATE MESSAGING TABLES
-- Run this BEFORE performance-indexes.sql
-- ============================================

-- Check existing tables first
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'conversation_participants', 'messages')
ORDER BY table_name;

-- ============================================
-- 1. CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CONVERSATION_PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- ============================================
-- 3. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
ON conversations FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Users can create conversations
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Users can update conversations they're part of
CREATE POLICY "Users can update their conversations"
ON conversations FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Users can delete conversations they're part of
CREATE POLICY "Users can delete their conversations"
ON conversations FOR DELETE
USING (
  id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- RLS POLICIES - CONVERSATION_PARTICIPANTS
-- ============================================

-- Users can view participants in their conversations
CREATE POLICY "Users can view conversation participants"
ON conversation_participants FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Users can add participants to conversations they're in
CREATE POLICY "Users can add conversation participants"
ON conversation_participants FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
  OR NOT EXISTS (
    SELECT 1 FROM conversation_participants WHERE conversation_id = conversation_participants.conversation_id
  )
);

-- Users can update their own participant record
CREATE POLICY "Users can update their participant record"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

-- Users can delete their own participant record
CREATE POLICY "Users can delete their participant record"
ON conversation_participants FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES - MESSAGES
-- ============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (
    SELECT conversation_id 
    FROM conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update their messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their messages"
ON messages FOR DELETE
USING (sender_id = auth.uid());

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Conversation participants indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
ON conversation_participants(user_id, conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv 
ON conversation_participants(conversation_id, user_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread 
ON messages(conversation_id, is_read, sender_id) 
WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

-- ============================================
-- ENABLE REALTIME
-- ============================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;

-- ============================================
-- VERIFY TABLES CREATED
-- ============================================

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'conversation_participants', 'messages')
ORDER BY table_name;

-- Verify indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, indexname;
