'use client';

import React, { createContext, useContext } from 'react';
import { useDashboardStats, useRecentUsers } from '../hooks/useDashboardData';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  // Use React Query hooks
  const statsQuery = useDashboardStats();
  const usersQuery = useRecentUsers();

  // Combine loading states
  const loading = statsQuery.isLoading || usersQuery.isLoading;
  
  // Combine error states
  const error = statsQuery.error || usersQuery.error;
  
  // Data source tracking
  const dataSource = (statsQuery.isSuccess && usersQuery.isSuccess) ? 'api' : 'mock';

  const value = {
    // Data
    stats: statsQuery.data,
    recentUsers: usersQuery.data,
    
    // States
    loading,
    error: error?.message,
    dataSource,
    
    // Actions
    loadDashboardData: () => {
      statsQuery.refetch();
      usersQuery.refetch();
    },
    refreshData: () => {
      statsQuery.refetch();
      usersQuery.refetch();
    }
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
