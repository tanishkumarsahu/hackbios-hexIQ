-- ============================================
-- FIX MESSAGING RLS POLICIES
-- Removes infinite recursion in policies
-- ============================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update their participant record" ON conversation_participants;
DROP POLICY IF EXISTS "Users can delete their participant record" ON conversation_participants;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their messages" ON messages;
DROP POLICY IF EXISTS "Users can delete their messages" ON messages;

-- ============================================
-- SIMPLE RLS POLICIES - NO RECURSION
-- ============================================

-- CONVERSATION_PARTICIPANTS - Simple user-based access
CREATE POLICY "Users can view their own participant records"
ON conversation_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert participant records"
ON conversation_participants FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own participant records"
ON conversation_participants FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own participant records"
ON conversation_participants FOR DELETE
USING (user_id = auth.uid());

-- CONVERSATIONS - Allow all authenticated users
CREATE POLICY "Authenticated users can view conversations"
ON conversations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update conversations"
ON conversations FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete conversations"
ON conversations FOR DELETE
TO authenticated
USING (true);

-- MESSAGES - Simple sender/conversation based access
CREATE POLICY "Users can view all messages"
ON messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (sender_id = auth.uid());

-- ============================================
-- VERIFY POLICIES
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('conversations', 'conversation_participants', 'messages')
ORDER BY tablename, policyname;
