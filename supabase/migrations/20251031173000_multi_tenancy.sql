-- ============================================
-- PHASE 1: MULTI-TENANCY IMPLEMENTATION
-- Add organization/college support to the platform
-- ============================================

-- 1. CREATE ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly name
  domain TEXT UNIQUE, -- e.g., "mit.edu" for email verification
  logo_url TEXT,
  website TEXT,
  description TEXT,
  
  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  postal_code TEXT,
  
  -- Status & Verification
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  
  -- Subscription & Limits
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  max_admins INTEGER DEFAULT 5,
  max_alumni INTEGER DEFAULT 1000,
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);

-- Enable RLS on organizations (policies added later after users.organization_id exists)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;


-- 2. ADD ORGANIZATION_ID TO USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);

-- Add organization context to user metadata
COMMENT ON COLUMN users.organization_id IS 'The organization/college this user belongs to';


-- 3. ADD ORGANIZATION_ID TO EVENTS TABLE
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_organization ON events(organization_id);

COMMENT ON COLUMN events.organization_id IS 'The organization this event belongs to';


-- 4. ADD ORGANIZATION_ID TO JOBS TABLE
-- ============================================
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);

COMMENT ON COLUMN jobs.organization_id IS 'The organization this job posting belongs to';


-- 5. ADD RLS POLICIES FOR ORGANIZATIONS TABLE
-- ============================================

-- Super admins can see all organizations
CREATE POLICY "Super admins can view all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Admins can see their own organization
CREATE POLICY "Admins can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Super admins can insert organizations
CREATE POLICY "Super admins can insert organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Super admins can update organizations
CREATE POLICY "Super admins can update organizations"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );


-- 6. UPDATE RLS POLICIES FOR USERS TABLE
-- ============================================

-- Drop old admin policies
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Admins can only view users in their organization
CREATE POLICY "Admins can view users in their organization"
  ON users FOR SELECT
  TO authenticated
  USING (
    CASE 
      -- Super admin can see all users
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' THEN true
      -- Admin can see users in their organization
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'admin' THEN
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      -- Regular users can see users in their organization
      ELSE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    END
  );

-- Admins can update users in their organization
CREATE POLICY "Admins can update users in their organization"
  ON users FOR UPDATE
  TO authenticated
  USING (
    CASE 
      -- Super admin can update all users
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' THEN true
      -- Admin can update users in their organization (except other admins)
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'admin' THEN
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND role = 'user'
      ELSE false
    END
  );


-- 7. UPDATE RLS POLICIES FOR EVENTS TABLE
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all events" ON events;

-- Users can view events in their organization
CREATE POLICY "Users can view events in their organization"
  ON events FOR SELECT
  TO authenticated
  USING (
    CASE 
      -- Super admin can see all events
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' THEN true
      -- Others can see events in their organization
      ELSE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    END
  );

-- Users can create events in their organization
CREATE POLICY "Users can create events in their organization"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );


-- 8. UPDATE RLS POLICIES FOR JOBS TABLE
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all jobs" ON jobs;

-- Users can view jobs in their organization
CREATE POLICY "Users can view jobs in their organization"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    CASE 
      -- Super admin can see all jobs
      WHEN (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' THEN true
      -- Others can see jobs in their organization
      ELSE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    END
  );

-- Users can create jobs in their organization
CREATE POLICY "Users can create jobs in their organization"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );


-- 9. CREATE ORGANIZATION-SPECIFIC ADMIN STATS VIEW
-- ============================================

-- Drop old view
DROP VIEW IF EXISTS admin_stats;

-- Create new organization-aware view
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  org.id as organization_id,
  org.name as organization_name,
  org.status as organization_status,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'user') as total_alumni,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_active = true AND u.role = 'user') as active_alumni,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_verified = true AND u.role = 'user') as verified_alumni,
  COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'admin') as total_admins,
  COUNT(DISTINCT e.id) as total_events,
  COUNT(DISTINCT e.id) FILTER (WHERE e.start_date > NOW()) as upcoming_events,
  COUNT(DISTINCT e.id) FILTER (WHERE e.start_date < NOW()) as past_events,
  COUNT(DISTINCT j.id) as total_jobs,
  COUNT(DISTINCT j.id) FILTER (WHERE j.is_active = true) as active_jobs,
  COUNT(DISTINCT j.id) FILTER (WHERE j.created_at > NOW() - INTERVAL '30 days') as jobs_this_month
FROM organizations org
LEFT JOIN users u ON u.organization_id = org.id
LEFT JOIN events e ON e.organization_id = org.id
LEFT JOIN jobs j ON j.organization_id = org.id
WHERE org.status = 'active'
GROUP BY org.id, org.name, org.status;

-- Grant access to admin_stats view
GRANT SELECT ON admin_stats TO authenticated;


-- 10. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to get user's organization
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in same organization
CREATE OR REPLACE FUNCTION is_same_organization(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN target_org_id = get_user_organization();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 11. UPDATE AUDIT LOGS TO INCLUDE ORGANIZATION
-- ============================================
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);


-- 12. CREATE DEMO ORGANIZATIONS (FOR TESTING)
-- ============================================

-- Insert demo organizations
INSERT INTO organizations (name, slug, domain, status, subscription_tier, description)
VALUES 
  ('Massachusetts Institute of Technology', 'mit', 'mit.edu', 'active', 'enterprise', 'Leading technology institute'),
  ('Stanford University', 'stanford', 'stanford.edu', 'active', 'premium', 'Premier research university'),
  ('Harvard University', 'harvard', 'harvard.edu', 'pending', 'basic', 'Ivy League institution')
ON CONFLICT (slug) DO NOTHING;


-- 13. CREATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE '✅ Multi-tenancy migration completed successfully!';
  RAISE NOTICE '📊 Organizations table created';
  RAISE NOTICE '🔗 Organization relationships added to users, events, jobs';
  RAISE NOTICE '🔒 RLS policies updated for organization context';
  RAISE NOTICE '📈 Admin stats view updated for organization-specific data';
  RAISE NOTICE '🎯 Demo organizations created (MIT, Stanford, Harvard)';
END $$;
