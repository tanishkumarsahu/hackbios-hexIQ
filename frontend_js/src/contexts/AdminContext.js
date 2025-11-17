'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const AdminContext = createContext(undefined);

export function AdminProvider({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [organization, setOrganization] = useState(null);

  // Fetch current user's organization
  const fetchOrganization = useCallback(async (userId) => {
    try {
      console.log('Fetching organization for user:', userId);
      
      if (!userId) {
        console.error('No user ID provided');
        return null;
      }

      // First get user's organization_id and role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      // Super admins don't need organization_id
      if (!userData?.organization_id) {
        if (userData?.role === 'super_admin') {
          console.log('✅ Super admin - no organization required');
          return null;
        }
        console.warn('User has no organization_id - this is normal for new users');
        return null;
      }

      console.log('User organization_id:', userData.organization_id);

      // Then fetch organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw orgError;
      }

      console.log('✅ Organization fetched:', orgData);
      setOrganization(orgData);
      return orgData;
    } catch (error) {
      console.error('Error fetching organization:', error);
      toast.error('Failed to load organization');
      return null;
    }
  }, []);

  // Fetch admin stats (organization-specific)
  const fetchAdminStats = useCallback(async (organizationId) => {
    try {
      setLoading(true);
      
      if (!organizationId) {
        console.warn('No organization ID provided');
        setStats(null);
        return null;
      }

      console.log('Fetching admin stats for organization:', organizationId);

      // Query the view with organization filter
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (error) {
        console.error('Error from admin_stats query:', error);
        throw error;
      }

      console.log('✅ Admin stats fetched:', data);
      
      if (data) {
        setStats(data);
        return data;
      } else {
        console.warn('No stats data returned for organization:', organizationId);
        // Return empty stats instead of null
        const emptyStats = {
          organization_id: organizationId,
          total_alumni: 0,
          active_alumni: 0,
          verified_alumni: 0,
          total_admins: 0,
          total_events: 0,
          upcoming_events: 0,
          past_events: 0,
          total_jobs: 0,
          active_jobs: 0,
          jobs_this_month: 0
        };
        setStats(emptyStats);
        return emptyStats;
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load statistics', {
        description: error.message || 'Please try again'
      });
      setStats(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users (admin only)
  const fetchAllUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user role (super admin only)
  const updateUserRole = useCallback(async (userId, newRole) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit({
        action: 'UPDATE_USER_ROLE',
        resource: 'users',
        resource_id: userId,
        details: { new_role: newRole }
      });

      toast.success(`User role updated to ${newRole}`);
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle user active status
  const toggleUserStatus = useCallback(async (userId, isActive) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit({
        action: isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        resource: 'users',
        resource_id: userId
      });

      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      return data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all events
  const fetchAllEvents = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select('*, created_by:users(name, email)')
        .order('start_date', { ascending: false });

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }
      if (filters.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      // Log audit
      await logAudit({
        action: 'DELETE_EVENT',
        resource: 'events',
        resource_id: eventId
      });

      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all jobs
  const fetchAllJobs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('*, posted_by:users(name, email)')
        .order('created_at', { ascending: false });

      if (filters.jobType) {
        query = query.eq('job_type', filters.jobType);
      }
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete job
  const deleteJob = useCallback(async (jobId) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      // Log audit
      await logAudit({
        action: 'DELETE_JOB',
        resource: 'jobs',
        resource_id: jobId
      });

      toast.success('Job deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch audit logs (super admin only)
  const fetchAuditLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*, user:users(name, email)')
        .order('created_at', { ascending: false })
        .limit(filters.limit || 100);

      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Log audit action
  const logAudit = useCallback(async ({ action, resource, resource_id, details }) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action,
          resource,
          resource_id,
          details,
          ip_address: null, // Will be set by backend if needed
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }, []);

  // Toggle user verification status
  const toggleUserVerification = useCallback(async (userId, isVerified) => {
    try {
      setLoading(true);
      
      // Validate inputs
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (typeof isVerified !== 'boolean') {
        throw new Error('Invalid verification status');
      }

      console.log(`Toggling verification for user ${userId} to ${isVerified}`);

      const { data, error } = await supabase
        .from('users')
        .update({ 
          is_verified: isVerified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log audit (non-blocking)
      logAudit({
        action: isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER',
        resource: 'users',
        resource_id: userId,
        details: { 
          is_verified: isVerified,
          verified_at: isVerified ? new Date().toISOString() : null
        }
      }).catch(err => console.error('Audit log failed:', err));

      toast.success(`User ${isVerified ? 'verified' : 'unverified'} successfully`);
      return data;
    } catch (error) {
      console.error('Error toggling user verification:', error);
      toast.error(`Failed to ${isVerified ? 'verify' : 'unverify'} user`, {
        description: error.message || 'Please try again'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin Logout - Production Ready with Complete State Clearing
  const adminLogout = useCallback(async () => {
    console.log('[Admin] 🚪 Logout: STARTED');
    
    try {
      // Set logout flag FIRST to prevent guards from blocking
      sessionStorage.setItem('isLoggingOut', 'true');
      sessionStorage.setItem('logoutToastShown', 'false');
      
      // Clear ALL session data IMMEDIATELY
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      console.log('[Admin] 🚪 Logout: STORAGE_CLEARED');
      
      // Logout from Supabase
      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('[Admin] 🚪 Logout: SUPABASE_LOGOUT success');
      } catch (error) {
        console.warn('[Admin] Supabase logout failed', error);
      }
      
      // Clear admin context state
      setStats(null);
      setOrganization(null);
      console.log('[Admin] 🚪 Logout: ADMIN_STATE_CLEARED');
      
      // Show toast with longer duration
      toast.success('Admin logged out successfully!', {
        description: 'You have been signed out of the admin panel.',
        duration: 5000,
        important: true
      });
      console.log('[Admin] 🚪 Logout: TOAST_SHOWN');
      
      // Wait for toast to be visible before redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to admin login
      console.log('[Admin] 🚪 Logout: REDIRECTING to /admin/login');
      await router.push('/admin/login');
      
      // Clean up logout flag after redirect
      setTimeout(() => {
        sessionStorage.removeItem('isLoggingOut');
      }, 1000);
      
    } catch (error) {
      // Even if logout fails, clear everything
      console.error('[Admin] Logout error', error);
      
      // Force clear everything
      sessionStorage.setItem('isLoggingOut', 'true');
      localStorage.clear();
      sessionStorage.clear();
      
      setStats(null);
      setOrganization(null);
      
      // Show toast
      toast.success('Admin logged out successfully!', {
        description: 'You have been signed out of the admin panel.',
        duration: 5000,
        important: true
      });
      
      // Redirect
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/admin/login');
      
      setTimeout(() => {
        sessionStorage.removeItem('isLoggingOut');
      }, 1000);
    }
  }, [router]);

  const value = {
    loading,
    stats,
    organization,
    fetchOrganization,
    fetchAdminStats,
    fetchAllUsers,
    updateUserRole,
    toggleUserStatus,
    toggleUserVerification,
    fetchAllEvents,
    deleteEvent,
    fetchAllJobs,
    deleteJob,
    fetchAuditLogs,
    logAudit,
    adminLogout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
