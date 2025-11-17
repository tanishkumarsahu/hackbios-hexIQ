-- Phase 1: Profile Picture, Job Applications, Event Registrations, Notifications
-- This migration adds new features to existing schema

-- ============================================
-- 1. ADD AVATAR URL TO USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================
-- 2. JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own applications"
ON job_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications"
ON job_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

-- ============================================
-- 3. EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own registrations"
ON event_registrations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations"
ON event_registrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registrations"
ON event_registrations FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- ============================================
-- 4. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 5. STORAGE BUCKET FOR AVATARS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
