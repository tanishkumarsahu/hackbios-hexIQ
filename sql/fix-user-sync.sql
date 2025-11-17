-- Check if user exists in users table
SELECT id, email, name FROM users WHERE id = '36ac5226-b788-4baa-bea1-d96b45640a29';

-- If user doesn't exist, insert from auth.users
INSERT INTO users (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email) as name,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE id = '36ac5226-b788-4baa-bea1-d96b45640a29'
ON CONFLICT (id) DO NOTHING;

-- Verify user now exists
SELECT id, email, name FROM users WHERE id = '36ac5226-b788-4baa-bea1-d96b45640a29';

-- Create trigger to auto-sync new auth users to users table
CREATE OR REPLACE FUNCTION sync_auth_user_to_users()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- Sync all existing auth users to users table
INSERT INTO users (id, email, name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email) as name,
  created_at,
  NOW() as updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = NOW();
