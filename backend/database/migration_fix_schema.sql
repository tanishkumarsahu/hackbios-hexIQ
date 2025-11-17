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

-- Migrate location data (assuming format: {"city": "X", "state": "Y", "country": "Z"})
UPDATE users 
SET location_text = CONCAT(
  COALESCE(location->>'city', ''), 
  CASE WHEN location->>'city' IS NOT NULL AND location->>'state' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'state', ''),
  CASE WHEN (location->>'city' IS NOT NULL OR location->>'state' IS NOT NULL) AND location->>'country' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'country', '')
)
WHERE location IS NOT NULL;

-- Step 5: Rename location to location_json and location_text to location
ALTER TABLE users RENAME COLUMN location TO location_json;
ALTER TABLE users RENAME COLUMN location_text TO location;

-- Step 6: Update indexes
CREATE INDEX IF NOT EXISTS idx_users_linkedin ON users(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_users_github ON users(github_url);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Step 7: Add RLS policies for new columns
-- (Policies already cover all columns via SELECT *)

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
