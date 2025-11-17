-- ============================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- Run this to dramatically improve query speed
-- ============================================

-- ============================================
-- NOTE: Run create-messaging-tables.sql FIRST
-- if messaging tables don't exist!
-- ============================================

-- ============================================
-- MESSAGING TABLES (OPTIONAL - Skip if tables don't exist)
-- ============================================

-- Check if messaging tables exist before creating indexes
DO $$
BEGIN
  -- Only create indexes if tables exist
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'messages') THEN
    -- Index for fetching messages by conversation
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at DESC);

    -- Index for unread message counts
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread 
    ON messages(conversation_id, is_read, sender_id) 
    WHERE is_read = false;
    
    RAISE NOTICE 'Messages indexes created';
  ELSE
    RAISE NOTICE 'Messages table does not exist - skipping indexes';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_participants') THEN
    -- Index for conversation participants lookup
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
    ON conversation_participants(user_id, conversation_id);

    CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv 
    ON conversation_participants(conversation_id, user_id);
    
    RAISE NOTICE 'Conversation participants indexes created';
  ELSE
    RAISE NOTICE 'Conversation participants table does not exist - skipping indexes';
  END IF;
END $$;

-- ============================================
-- CONNECTIONS TABLE
-- ============================================

-- Index for finding user connections
CREATE INDEX IF NOT EXISTS idx_connections_requester_status 
ON connections(requester_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_connections_recipient_status 
ON connections(recipient_id, status, created_at DESC);

-- Composite index for connection lookups
CREATE INDEX IF NOT EXISTS idx_connections_users_status 
ON connections(requester_id, recipient_id, status);

-- ============================================
-- USERS TABLE
-- ============================================

-- Index for recent users (dashboard)
CREATE INDEX IF NOT EXISTS idx_users_created_at 
ON users(created_at DESC);

-- Index for active users
CREATE INDEX IF NOT EXISTS idx_users_updated_at 
ON users(updated_at DESC);

-- Index for verified users (has company)
CREATE INDEX IF NOT EXISTS idx_users_company 
ON users(current_company) 
WHERE current_company IS NOT NULL;

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_users_name 
ON users(name);

CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- ============================================
-- JOBS TABLE
-- ============================================

-- Index for job listings
CREATE INDEX IF NOT EXISTS idx_jobs_created_at 
ON jobs(created_at DESC);

-- Index for job search
CREATE INDEX IF NOT EXISTS idx_jobs_title 
ON jobs(title);

CREATE INDEX IF NOT EXISTS idx_jobs_company 
ON jobs(company);

-- Index for job location search
CREATE INDEX IF NOT EXISTS idx_jobs_location 
ON jobs(location);

-- ============================================
-- EVENTS TABLE
-- ============================================

-- Index for upcoming events (using created_at since 'date' column may not exist)
CREATE INDEX IF NOT EXISTS idx_events_created_at 
ON events(created_at DESC);

-- Index for event search
CREATE INDEX IF NOT EXISTS idx_events_title 
ON events(title);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

-- Index for user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read) 
WHERE is_read = false;

-- ============================================
-- JOB BOOKMARKS TABLE
-- ============================================

-- Index for user bookmarks
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_user 
ON job_bookmarks(user_id, created_at DESC);

-- Index for job bookmark lookup
CREATE INDEX IF NOT EXISTS idx_job_bookmarks_job_user 
ON job_bookmarks(job_id, user_id);

-- ============================================
-- EVENT ATTENDEES TABLE
-- ============================================

-- Index for event attendees
CREATE INDEX IF NOT EXISTS idx_event_attendees_event 
ON event_attendees(event_id, status);

-- Index for user events
CREATE INDEX IF NOT EXISTS idx_event_attendees_user 
ON event_attendees(user_id, status);

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Check all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index sizes
SELECT
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
