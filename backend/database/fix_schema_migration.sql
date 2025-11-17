-- Migration to fix users table schema
-- Run this in Supabase SQL Editor

-- Step 1: Add missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location_text TEXT;

-- Step 2: Migrate data from social_links JSONB to individual columns
UPDATE users 
SET 
  linkedin_url = social_links->>'linkedin',
  github_url = social_links->>'github',
  website_url = social_links->>'website'
WHERE social_links IS NOT NULL;

-- Step 3: Convert location JSONB to TEXT (format: "City, State, Country")
UPDATE users 
SET location_text = CONCAT(
  COALESCE(location->>'city', ''), 
  CASE WHEN location->>'city' IS NOT NULL AND location->>'state' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'state', ''),
  CASE WHEN (location->>'city' IS NOT NULL OR location->>'state' IS NOT NULL) AND location->>'country' IS NOT NULL THEN ', ' ELSE '' END,
  COALESCE(location->>'country', '')
)
WHERE location IS NOT NULL;

-- Step 4: Rename columns (keep old ones for backup)
ALTER TABLE users RENAME COLUMN location TO location_json;
ALTER TABLE users RENAME COLUMN location_text TO location;

-- Step 5: Copy profile_pic to avatar_url (if needed)
UPDATE users 
SET avatar_url = profile_pic
WHERE profile_pic IS NOT NULL AND avatar_url IS NULL;

-- Step 6: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_linkedin ON users(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_users_github ON users(github_url);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

-- Step 7: Verification query
SELECT 
  name,
  location,
  linkedin_url,
  github_url,
  website_url,
  current_company,
  graduation_year
FROM users 
LIMIT 5;
