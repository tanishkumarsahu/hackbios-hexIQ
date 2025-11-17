-- RLS Policies for Job Posting Feature

-- Allow authenticated users to create jobs
CREATE POLICY "Users can create jobs"
ON jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = posted_by);

-- Allow users to update their own jobs
CREATE POLICY "Users can update own jobs"
ON jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = posted_by)
WITH CHECK (auth.uid() = posted_by);

-- Allow users to delete their own jobs
CREATE POLICY "Users can delete own jobs"
ON jobs
FOR DELETE
TO authenticated
USING (auth.uid() = posted_by);

-- Allow users to view their own jobs (including inactive)
CREATE POLICY "Users can view own jobs"
ON jobs
FOR SELECT
TO authenticated
USING (auth.uid() = posted_by OR is_active = true);
