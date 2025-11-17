-- Check if the recipient user exists
SELECT * FROM users WHERE id = '272e85c0-2ab6-4ec9-8727-ac0da59536d5';

-- Check all users
SELECT id, name, email FROM users LIMIT 10;
