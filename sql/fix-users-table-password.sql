-- Make password column nullable (OAuth users don't have passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Now sync all auth users to users table
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

-- Create auto-sync trigger
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_users();

-- Verify sync worked
SELECT COUNT(*) as synced_users FROM users;
