# 🚀 Complete Supabase Setup Guide for AlumNode

## Step 1: Run Migration to Fix Schema

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Migration to fix schema and match frontend expectations
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Migrate data from social_links JSONB to individual columns
UPDATE users 
SET 
  linkedin_url = social_links->>'linkedin',
  github_url = social_links->>'github',
  website_url = social_links->>'website'
WHERE social_links IS NOT NULL;

-- Step 3: Migrate profile_pic to avatar_url
UPDATE users 
SET avatar_url = profile_pic
WHERE profile_pic IS NOT NULL AND avatar_url IS NULL;

-- Step 4: Convert location JSONB to TEXT for simpler queries
-- First, create a new column
ALTER TABLE users ADD COLUMN IF NOT EXISTS location_text TEXT;

-- Migrate location data (format: "City, State, Country")
UPDATE users 
SET location_text = CONCAT(
  COALESCE(location->>'city', ''), 
  CASE WHEN location->>'city' IS NOT NULL AND location->>'state' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'state', ''),
  CASE WHEN (location->>'city' IS NOT NULL OR location->>'state' IS NOT NULL) AND location->>'country' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'country', '')
)
WHERE location IS NOT NULL;

-- Step 5: Rename columns
ALTER TABLE users RENAME COLUMN location TO location_json;
ALTER TABLE users RENAME COLUMN location_text TO location;

-- Step 6: Update indexes
CREATE INDEX IF NOT EXISTS idx_users_linkedin ON users(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_users_github ON users(github_url);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Verification query
SELECT 
  id,
  name,
  email,
  location,
  linkedin_url,
  github_url,
  website_url,
  avatar_url,
  current_title,
  current_company,
  graduation_year,
  degree
FROM users 
LIMIT 5;
```

## Step 2: Clear Old Data (Optional)

If you want to start fresh:

```sql
-- Delete all existing data
TRUNCATE TABLE event_attendees CASCADE;
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE mentorship_requests CASCADE;
TRUNCATE TABLE jobs CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE users CASCADE;
```

## Step 3: Re-seed Data

Run the seed.sql file in Supabase SQL Editor:
- File: `backend/database/seed.sql`
- This will insert 10 Indian users, 5 events, 6 jobs

## Step 4: Verify Data

```sql
-- Check users
SELECT 
  name, 
  email, 
  location, 
  current_company, 
  linkedin_url,
  graduation_year
FROM users;

-- Check events
SELECT title, event_type, start_date FROM events;

-- Check jobs
SELECT title, company, job_type FROM jobs;
```

## Step 5: Update RLS Policies

Make sure Row Level Security allows reading:

```sql
-- Allow public read access for testing
CREATE POLICY "Allow public read" ON users 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read events" ON events 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public read jobs" ON jobs 
FOR SELECT 
USING (true);
```

## Step 6: Test Connection

1. **Backend**: Should already be running on port 5000
2. **Frontend**: Should already be running on port 3001
3. **Refresh browser**: You should see real data!

## Expected Result

✅ **Dashboard**: Shows 10 users from Supabase  
✅ **Alumni Page**: Shows all 10 Indian alumni with real data  
✅ **Events**: Shows 5 upcoming events  
✅ **Jobs**: Shows 6 job postings  

## Troubleshooting

### If you still see "Could not find table"
- Check table name is `users` not `profiles`
- Run migration script again

### If you see "column does not exist"
- Run Step 1 migration script
- Verify columns exist: `\d users` in SQL editor

### If you see 404 errors
- Check RLS policies (Step 5)
- Make sure anon key has read access

## Current Schema Structure

```
users table:
- id (UUID)
- email (VARCHAR)
- name (VARCHAR)
- location (TEXT) ← Changed from JSONB
- linkedin_url (TEXT) ← New
- github_url (TEXT) ← New
- website_url (TEXT) ← New
- avatar_url (TEXT) ← New
- current_title (VARCHAR)
- current_company (VARCHAR)
- graduation_year (INTEGER)
- degree (VARCHAR)
- major (VARCHAR)
- bio (TEXT)
- phone (VARCHAR)
- skills (TEXT[])
- interests (TEXT[])
- is_verified (BOOLEAN)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Next Steps After Setup

1. ✅ Verify all pages load with real data
2. ✅ Test search and filters on Alumni page
3. ✅ Test event registration
4. ✅ Test job applications
5. 🚀 Deploy to production!
