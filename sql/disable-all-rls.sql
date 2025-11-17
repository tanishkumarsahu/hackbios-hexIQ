-- Disable RLS on all tables temporarily for development

-- Core tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees DISABLE ROW LEVEL SECURITY;

-- New Phase 2 tables
ALTER TABLE job_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;

-- Application tables (if they exist)
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Messages tables (when created)
-- ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
