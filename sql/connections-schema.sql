-- Connections Table
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  message TEXT, -- Optional message with connection request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate connections
  UNIQUE(requester_id, recipient_id),
  
  -- Prevent self-connections
  CHECK (requester_id != recipient_id)
);

-- Indexes for performance
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);

-- RLS Policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections"
ON connections
FOR SELECT
TO authenticated
USING (
  auth.uid() = requester_id OR 
  auth.uid() = recipient_id
);

-- Users can send connection requests
CREATE POLICY "Users can send connection requests"
ON connections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

-- Users can update connections they're recipient of (accept/reject)
CREATE POLICY "Recipients can update connection requests"
ON connections
FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- Users can delete connections they're part of
CREATE POLICY "Users can delete own connections"
ON connections
FOR DELETE
TO authenticated
USING (
  auth.uid() = requester_id OR 
  auth.uid() = recipient_id
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER connections_updated_at
BEFORE UPDATE ON connections
FOR EACH ROW
EXECUTE FUNCTION update_connections_updated_at();
