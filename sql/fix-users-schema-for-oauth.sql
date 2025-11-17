-- Fix users table to support OAuth users
-- Make fields optional that OAuth users don't have

-- 1. Make password nullable (OAuth users don't have passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Make graduation_year nullable (can be filled later in profile)
ALTER TABLE users ALTER COLUMN graduation_year DROP NOT NULL;

-- 3. Make degree nullable (can be filled later in profile)
ALTER TABLE users ALTER COLUMN degree DROP NOT NULL;

-- 4. Add default values for name if needed
ALTER TABLE users ALTER COLUMN name SET DEFAULT 'New User';

-- 5. Sync all existing auth users to users table
INSERT INTO users (
  id, 
  email, 
  name, 
  created_at, 
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'name', 
    split_part(email, '@', 1)
  ) as name,
  created_at,
  NOW() as updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, users.name),
  updated_at = NOW();

-- 6. Create trigger to auto-sync new auth users
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id, 
    email, 
    name, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 8. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- 9. Verify sync worked
SELECT 
  COUNT(*) as total_users,
  COUNT(password) as users_with_password,
  COUNT(*) - COUNT(password) as oauth_users
FROM users;
