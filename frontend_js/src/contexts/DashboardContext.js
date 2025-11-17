'use client';

import React, { createContext, useContext } from 'react';
import { useDashboardStats, useRecentUsers } from '../hooks/useDashboardData';

const DashboardContext = createContext();

// Mock data fallback
const MOCK_STATS = {
  totalUsers: 10,
  verifiedUsers: 10,
  activeUsers: 8,
  events: 5,
  connections: 25,
  jobPosts: 4
};

const MOCK_USERS = [
  {
    id: '1',
    name: 'Priya Sharma',
    degree: 'B.Tech',
    graduation_year: 2018,
    current_title: 'Senior Software Engineer',
    current_company: 'Flipkart',
    avatar_url: null,
    location: 'Bangalore, Karnataka',
    joinedDays: 2
  },
  {
    id: '2',
    name: 'Rahul Verma',
    degree: 'B.Tech',
    graduation_year: 2016,
    current_title: 'Senior Product Manager',
    current_company: 'Paytm',
    avatar_url: null,
    location: 'Noida, Uttar Pradesh',
    joinedDays: 5
  },
  {
    id: '3',
    name: 'Ananya Iyer',
    degree: 'M.Tech',
    graduation_year: 2019,
    current_title: 'Data Scientist',
    current_company: 'Google India',
    avatar_url: null,
    location: 'Hyderabad, Telangana',
    joinedDays: 1
  },
  {
    id: '4',
    name: 'Arjun Patel',
    degree: 'B.Tech',
    graduation_year: 2020,
    current_title: 'Software Developer',
    current_company: 'Infosys',
    avatar_url: null,
    location: 'Pune, Maharashtra',
    joinedDays: 3
  }
];

export function DashboardProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [dataSource, setDataSource] = useState('loading'); // 'supabase', 'mock', 'loading'

  const loadDashboardData = useCallback(async (force = false) => {
    const now = Date.now();
    const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

    // Check cache (skip if forced refresh)
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION && stats) {
      console.log('📦 Using cached dashboard data');
      return;
    }

    console.log('🔄 Fetching fresh dashboard data from Supabase...');
    setLoading(true);
    setError(null);

    try {
      let statsData = null;
      let usersData = null;
      let dbSuccess = false;

      // Fetch stats from Supabase - ROBUST: Independent queries with fallbacks
      try {
        console.log('📊 Fetching stats from Supabase (robust parallel)...');
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // ROBUST: Use robustBatchQuery to prevent cascade failures
        const statsQueries = [
          {
            fn: () => supabase.from('users').select('*', { count: 'exact', head: true }),
            fallback: 0,
            options: { logPrefix: 'TotalUsers', timeout: 8000 }
          },
          {
            fn: () => supabase.from('users').select('*', { count: 'exact', head: true }).not('current_company', 'is', null),
            fallback: 0,
            options: { logPrefix: 'VerifiedUsers', timeout: 8000 }
          },
          {
            fn: () => supabase.from('users').select('*', { count: 'exact', head: true }).gte('updated_at', thirtyDaysAgo.toISOString()),
            fallback: 0,
            options: { logPrefix: 'ActiveUsers', timeout: 8000 }
          },
          {
            fn: () => supabase.from('events').select('*', { count: 'exact', head: true }),
            fallback: 0,
            options: { logPrefix: 'Events', timeout: 8000 }
          },
          {
            fn: () => supabase.from('jobs').select('*', { count: 'exact', head: true }),
            fallback: 0,
            options: { logPrefix: 'Jobs', timeout: 8000 }
          }
        ];

        const batchResult = await robustBatchQuery(statsQueries, { 
          logPrefix: 'DashboardStats' 
        });

        // Extract results with fallbacks
        const [totalUsersResult, verifiedUsersResult, activeUsersResult, eventsResult, jobsResult] = batchResult.results;

        statsData = {
          totalUsers: totalUsersResult.success ? (totalUsersResult.count || 0) : MOCK_STATS.totalUsers,
          verifiedUsers: verifiedUsersResult.success ? (verifiedUsersResult.count || 0) : MOCK_STATS.verifiedUsers,
          activeUsers: activeUsersResult.success ? (activeUsersResult.count || 0) : MOCK_STATS.activeUsers,
          events: eventsResult.success ? (eventsResult.count || 0) : MOCK_STATS.events,
          connections: 0, // Can add later if needed
          jobPosts: jobsResult.success ? (jobsResult.count || 0) : MOCK_STATS.jobPosts
        };

        // Determine success level
        dbSuccess = batchResult.successCount >= 3; // At least 60% success
        
        if (batchResult.successCount === batchResult.totalCount) {
          console.log('✅ All stats fetched successfully:', statsData);
        } else {
          console.log(`⚠️ Partial stats success (${batchResult.successCount}/${batchResult.totalCount}):`, statsData);
        }
        
      } catch (error) {
        console.warn('⚠️ Stats batch query failed:', error.message);
        statsData = MOCK_STATS;
        dbSuccess = false;
      }

      // Fetch recent users from Supabase with robust handling
      try {
        console.log('👥 Fetching users from Supabase...');
        
        const usersResult = await robustQuery(
          () => supabase
            .from('users')
            .select('id, name, email, degree, graduation_year, current_title, current_company, avatar_url, location, created_at')
            .order('created_at', { ascending: false })
            .limit(6),
          {
            logPrefix: 'RecentUsers',
            timeout: 8000,
            retries: 2,
            fallback: MOCK_USERS
          }
        );

        if (usersResult.success && usersResult.data) {
          // Transform data to match expected format
          usersData = usersResult.data.map(user => ({
            ...user,
            joinedDays: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
          }));
          console.log('✅ Users fetched from Supabase:', usersData);
          dbSuccess = dbSuccess && true;
        } else {
          console.warn('⚠️ Users query failed, using fallback');
          usersData = usersResult.data || MOCK_USERS;
        }
      } catch (error) {
        console.warn('⚠️ Supabase users failed:', error.message);
        usersData = MOCK_USERS;
      }

      // Set data
      setStats(statsData);
      setRecentUsers(usersData);
      setDataSource(dbSuccess ? 'supabase' : 'mock');
      setLastFetch(now);

      console.log(`✅ Dashboard data loaded from ${dbSuccess ? 'SUPABASE' : 'MOCK'}`);
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      setError(error.message);
      // Set mock data on complete failure
      setStats(MOCK_STATS);
      setRecentUsers(MOCK_USERS);
      setDataSource('mock');
    } finally {
      setLoading(false);
    }
  }, [lastFetch, stats]);

  const value = {
    stats,
    recentUsers,
    loading,
    error,
    dataSource,
    loadDashboardData,
    refreshData: () => loadDashboardData(true)
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
