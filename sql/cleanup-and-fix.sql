-- STEP 1: Drop the problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS sync_auth_user_to_users();

-- STEP 2: Check if there are any policies blocking inserts
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- STEP 3: Temporarily disable RLS to test
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- STEP 4: Check current users table structure again
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- STEP 5: Test manual insert to see what works
-- Replace with your actual auth user ID
DO $$
DECLARE
  test_user_id uuid;
  test_email text;
  test_name text;
BEGIN
  -- Get first auth user
  SELECT id, email INTO test_user_id, test_email
  FROM auth.users
  LIMIT 1;
  
  -- Try to insert
  INSERT INTO users (id, email, name, created_at, updated_at)
  VALUES (
    test_user_id,
    test_email,
    split_part(test_email, '@', 1),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Test insert successful for user: %', test_email;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Test insert failed: %', SQLERRM;
END $$;

-- STEP 6: Check if insert worked
SELECT id, email, name FROM users ORDER BY created_at DESC LIMIT 3;
