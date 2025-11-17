-- SIMPLE FIX: Just drop the trigger and let app handle user creation
-- This is safer and gives you more control

-- 1. Remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_users();

-- 2. Make name nullable (in case it's not)
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- 3. Disable RLS temporarily for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 4. Manually sync existing auth users (one-time)
INSERT INTO users (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  split_part(email, '@', 1) as name,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.id = auth.users.id
);

-- 5. Verify users synced
SELECT COUNT(*) as total_users FROM users;
SELECT id, email, name FROM users ORDER BY created_at DESC LIMIT 5;
