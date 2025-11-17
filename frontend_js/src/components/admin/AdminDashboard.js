'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import {
  Users,
  Calendar,
  Briefcase,
  Activity,
  TrendingUp,
  UserCheck,
  Shield,
  BarChart3,
  LogOut
} from 'lucide-react';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';
import EventManagement from './EventManagement';
import JobManagement from './JobManagement';
import { Breadcrumb } from '../ui/Breadcrumb';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { fetchAdminStats, fetchOrganization, stats, organization, adminLogout } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const loadedUserIdRef = useRef(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await adminLogout();
  };

  useEffect(() => {
    const loadData = async () => {
      // Only load once per user
      if (!user?.id || loadedUserIdRef.current === user.id) {
        return;
      }

      loadedUserIdRef.current = user.id;

      try {
        console.log('🚀 Loading admin dashboard data for user:', user.id);

        // Fetch organization first
        const org = await fetchOrganization(user.id);
        
        console.log('✅ Organization returned:', org);

        if (org?.id) {
          console.log('🔄 Fetching stats for organization:', org.id);
          await fetchAdminStats(org.id);
          console.log('✅ Stats fetch completed!');
        } else {
          console.error('❌ No organization found for user');
        }
      } catch (err) {
        console.error('❌ Error loading admin dashboard:', err);
      }
    };

    loadData();
  }, [user?.id]); // Only depend on user.id

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'jobs', label: 'Jobs', icon: Briefcase }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumbs */}
            <Breadcrumb 
              items={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: activeTab === 'overview' ? 'Dashboard' : 
                         activeTab === 'users' ? 'Users' : 
                         activeTab === 'events' ? 'Events' : 'Jobs' }
              ]}
              className="mb-4"
            />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {/* Enhanced Shield Icon */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30 rounded-full"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user?.name || 'Admin'}
                  {organization && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • {organization.name}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Admin
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className={`h-4 w-4 ${isLoggingOut ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex space-x-4 border-b">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <AdminStats stats={stats} />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'events' && <EventManagement />}
        {activeTab === 'jobs' && <JobManagement />}
      </div>
    </div>
  );
}
