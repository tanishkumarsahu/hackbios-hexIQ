-- Fix users table for OAuth authentication
-- Based on actual schema analysis

-- 1. Make name nullable (OAuth users may not have name initially)
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- 2. Sync all existing auth users to users table
INSERT INTO users (
  id, 
  email, 
  name,
  avatar_url,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'name',
    au.raw_user_meta_data->>'user_name',
    split_part(au.email, '@', 1)
  ) as name,
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ) as avatar_url,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
  updated_at = NOW();

-- 3. Create trigger to auto-sync new auth users
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id, 
    email, 
    name,
    avatar_url,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- 6. Verify sync worked
SELECT 
  COUNT(*) as total_users,
  COUNT(password) as users_with_password,
  COUNT(*) - COUNT(password) as oauth_users,
  COUNT(name) as users_with_name
FROM users;

-- 7. Check synced users
SELECT id, email, name, avatar_url, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
