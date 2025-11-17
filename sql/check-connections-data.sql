-- Check if connections table has any data
SELECT COUNT(*) as total_connections FROM connections;

-- Check connections by status
SELECT status, COUNT(*) as count 
FROM connections 
GROUP BY status;

-- Check all connections with user details
SELECT 
  c.id,
  c.requester_id,
  c.recipient_id,
  c.status,
  c.created_at,
  u1.name as requester_name,
  u2.name as recipient_name
FROM connections c
LEFT JOIN users u1 ON c.requester_id = u1.id
LEFT JOIN users u2 ON c.recipient_id = u2.id
ORDER BY c.created_at DESC
LIMIT 10;

-- Check if your user has any connections
-- Replace with your actual user ID
SELECT * FROM connections 
WHERE requester_id = '36ac5226-b788-4baa-bea1-d96b45640a29' 
   OR recipient_id = '36ac5226-b788-4baa-bea1-d96b45640a29';
