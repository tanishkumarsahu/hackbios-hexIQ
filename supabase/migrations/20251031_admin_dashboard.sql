-- ============================================
-- ADMIN DASHBOARD SETUP - HACKATHON VERSION
-- Created: 2025-10-31
-- Purpose: Add role-based access control for admin/super-admin
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ADD ROLE COLUMN TO USERS TABLE
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add constraint for valid roles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE public.users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'admin', 'super_admin'));
  END IF;
END $$;

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ============================================
-- 2. CREATE AUDIT LOGS TABLE (For Admin Actions)
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource);

-- ============================================
-- 3. RLS POLICIES FOR ADMIN ACCESS
-- ============================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users 
    WHERE id = auth.uid()
  ) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role FROM public.users 
    WHERE id = auth.uid()
  ) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admins_view_all_users" ON public.users;
DROP POLICY IF EXISTS "super_admins_update_users" ON public.users;
DROP POLICY IF EXISTS "users_view_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;

-- Users can view their own profile
CREATE POLICY "users_view_own_profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "admins_view_all_users" ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "users_update_own_profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

-- Super admins can update any user (including role)
CREATE POLICY "super_admins_update_users" ON public.users
  FOR UPDATE
  USING (public.is_super_admin());

-- ============================================
-- AUDIT LOGS POLICIES
-- ============================================

DROP POLICY IF EXISTS "super_admins_view_audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.audit_logs;

-- Only super admins can view audit logs
CREATE POLICY "super_admins_view_audit_logs" ON public.audit_logs
  FOR SELECT
  USING (public.is_super_admin());

-- System can insert audit logs
CREATE POLICY "system_insert_audit_logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- EVENTS TABLE POLICIES (Admin Management)
-- ============================================

DROP POLICY IF EXISTS "admins_view_all_events" ON public.events;
DROP POLICY IF EXISTS "admins_manage_events" ON public.events;

-- Admins can view all events
CREATE POLICY "admins_view_all_events" ON public.events
  FOR SELECT
  USING (public.is_admin());

-- Admins can manage all events
CREATE POLICY "admins_manage_events" ON public.events
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- JOBS TABLE POLICIES (Admin Management)
-- ============================================

DROP POLICY IF EXISTS "admins_view_all_jobs" ON public.jobs;
DROP POLICY IF EXISTS "admins_manage_jobs" ON public.jobs;

-- Admins can view all jobs
CREATE POLICY "admins_view_all_jobs" ON public.jobs
  FOR SELECT
  USING (public.is_admin());

-- Admins can manage all jobs
CREATE POLICY "admins_manage_jobs" ON public.jobs
  FOR ALL
  USING (public.is_admin());

-- ============================================
-- CONNECTIONS TABLE POLICIES (Admin View)
-- ============================================

DROP POLICY IF EXISTS "admins_view_all_connections" ON public.connections;

-- Admins can view all connections
CREATE POLICY "admins_view_all_connections" ON public.connections
  FOR SELECT
  USING (public.is_admin());

-- ============================================
-- MESSAGES TABLE POLICIES (Admin Moderation)
-- ============================================

DROP POLICY IF EXISTS "admins_view_all_messages" ON public.messages;

-- Admins can view all messages (for moderation)
CREATE POLICY "admins_view_all_messages" ON public.messages
  FOR SELECT
  USING (public.is_admin());

-- ============================================
-- 4. CREATE ADMIN STATS VIEW
-- ============================================

-- Drop existing view if it has different structure
DROP VIEW IF EXISTS public.admin_stats;

CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.users) AS total_users,
  (SELECT COUNT(*) FROM public.users WHERE is_active = true) AS active_users,
  (SELECT COUNT(*) FROM public.users WHERE is_verified = true) AS verified_users,
  (SELECT COUNT(*) FROM public.users WHERE role = 'admin') AS total_admins,
  (SELECT COUNT(*) FROM public.users WHERE role = 'super_admin') AS total_super_admins,
  (SELECT COUNT(*) FROM public.events) AS total_events,
  (SELECT COUNT(*) FROM public.events WHERE start_date > NOW()) AS upcoming_events,
  (SELECT COUNT(*) FROM public.jobs) AS total_jobs,
  (SELECT COUNT(*) FROM public.jobs WHERE is_active = true) AS active_jobs,
  (SELECT COUNT(*) FROM public.connections) AS total_connections,
  (SELECT COUNT(*) FROM public.connections WHERE status = 'accepted') AS accepted_connections,
  (SELECT COUNT(*) FROM public.messages) AS total_messages,
  (SELECT COUNT(*) FROM public.job_applications) AS total_applications;

-- Grant access to authenticated users (will check role in app)
GRANT SELECT ON public.admin_stats TO authenticated;

-- ============================================
-- 5. SEED FIRST SUPER ADMIN (Optional - Update email)
-- ============================================

-- Uncomment and update email to make yourself super admin
-- UPDATE public.users 
-- SET role = 'super_admin' 
-- WHERE email = 'your-email@example.com';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Admin Dashboard Migration Complete!';
  RAISE NOTICE '📊 Tables: users (role added), audit_logs (created)';
  RAISE NOTICE '🔐 RLS Policies: Created for admin access';
  RAISE NOTICE '📈 Admin Stats View: Created';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '1. Update a user to super_admin role in Supabase Dashboard';
  RAISE NOTICE '2. Test admin access in your app';
  RAISE NOTICE '3. Build admin UI components';
END $$;
