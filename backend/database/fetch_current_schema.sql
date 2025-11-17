-- Run this in Supabase SQL Editor to see your current schema

-- 1. List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Get users table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Get events table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Get jobs table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'jobs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check if data exists
SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
  'events' as table_name,
  COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
  'jobs' as table_name,
  COUNT(*) as row_count
FROM jobs;

-- 6. Sample data from users (to see actual structure)
SELECT 
  id,
  name,
  email,
  location,
  social_links,
  profile_pic,
  current_company,
  graduation_year
FROM users 
LIMIT 3;
