import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// All mock data removed - using real database data only

// Fetch dashboard stats with REAL database queries
const fetchDashboardStats = async () => {
  console.log('📊 Fetching dashboard stats with React Query...');
  
  try {
    // Parallel queries for better performance - ALL REAL DATA
    const [
      totalUsersResult,
      verifiedUsersResult,
      activeUsersResult,
      eventsResult
    ] = await Promise.allSettled([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('events').select('*', { count: 'exact', head: true })
    ]);
    
    const totalUsers = totalUsersResult.status === 'fulfilled' ? totalUsersResult.value.count || 0 : 0;
    const verifiedUsers = verifiedUsersResult.status === 'fulfilled' ? verifiedUsersResult.value.count || 0 : 0;
    const activeUsers = activeUsersResult.status === 'fulfilled' ? activeUsersResult.value.count || 0 : 0;
    const events = eventsResult.status === 'fulfilled' ? eventsResult.value.count || 0 : 0;
    
    const stats = {
      totalUsers,
      verifiedUsers,  // ✅ Real count from database
      activeUsers,    // ✅ Real count from database
      events,         // ✅ Real count from database
      connections: 0  // TODO: Add connections count when table is ready
    };
    
    console.log('✅ Dashboard stats fetched successfully (REAL DATA):', stats);
    return stats;
    
  } catch (error) {
    console.error('❌ Stats fetch failed:', error.message);
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      activeUsers: 0,
      events: 0,
      connections: 0
    };
  }
};

// Fetch recent verified alumni for "Alumni you should connect with"
const fetchRecentUsers = async () => {
  console.log('👥 Fetching verified alumni with React Query...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, current_title, current_company, location, avatar_url, graduation_year, degree, skills')
      .eq('is_verified', true)  // ✅ Only verified alumni
      .eq('is_active', true)    // ✅ Only active users
      .order('created_at', { ascending: false })
      .limit(6);
      
    if (error) throw error;
    
    console.log('✅ Verified alumni fetched successfully:', data?.length || 0, 'users');
    return data || [];
    
  } catch (error) {
    console.error('❌ Failed to fetch verified alumni:', error.message);
    return []; // Return empty array instead of mock data
  }
};

// Custom hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30 * 1000,      // 30 seconds - shorter for fresher data
    gcTime: 5 * 60 * 1000,     // 5 minutes
    refetchOnMount: 'always',  // ✅ Always refetch on mount
    refetchOnWindowFocus: true // ✅ Refetch when tab gains focus
  });
};

export const useRecentUsers = () => {
  return useQuery({
    queryKey: ['recent-users'],
    queryFn: fetchRecentUsers,
    staleTime: 30 * 1000,      // 30 seconds - shorter for fresher data
    gcTime: 3 * 60 * 1000,     // 3 minutes
    refetchOnMount: 'always',  // ✅ Always refetch on mount
    refetchOnWindowFocus: true // ✅ Refetch when tab gains focus
  });
};
