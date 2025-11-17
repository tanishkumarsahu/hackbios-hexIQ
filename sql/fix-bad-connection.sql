-- Delete the connection with non-existent user
DELETE FROM connections 
WHERE id = '1dc9ba37-1d7c-4ece-a92f-c74add5d7c7b';

-- Verify it's deleted
SELECT COUNT(*) FROM connections;

-- Now you can create a new connection from the UI
