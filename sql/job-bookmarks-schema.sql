-- Job Bookmarks Table
CREATE TABLE IF NOT EXISTS job_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only bookmark a job once
  UNIQUE(user_id, job_id)
);

-- Index for faster queries
CREATE INDEX idx_job_bookmarks_user_id ON job_bookmarks(user_id);
CREATE INDEX idx_job_bookmarks_job_id ON job_bookmarks(job_id);

-- RLS Policies
ALTER TABLE job_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
ON job_bookmarks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create bookmarks
CREATE POLICY "Users can create bookmarks"
ON job_bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON job_bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
