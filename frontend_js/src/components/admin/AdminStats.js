'use client';

import {
  Users,
  UserCheck,
  Calendar,
  Briefcase,
  MessageSquare,
  UserPlus,
  Shield,
  Activity
} from 'lucide-react';

export default function AdminStats({ stats }) {
  console.log('AdminStats received stats:', stats);
  
  if (!stats) {
    console.log('AdminStats: No stats, showing loading skeleton');
    return (
      <div>
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">Loading statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  console.log('AdminStats: Rendering with stats:', {
    total_alumni: stats.total_alumni,
    total_users: stats.total_users,
    active_alumni: stats.active_alumni,
    total_events: stats.total_events,
    total_jobs: stats.total_jobs
  });

  const statCards = [
    {
      title: 'Total Alumni',
      value: stats.total_alumni || stats.total_users || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Alumni',
      value: stats.active_alumni || stats.active_users || 0,
      icon: UserCheck,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Verified Alumni',
      value: stats.verified_alumni || stats.verified_users || 0,
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Total Admins',
      value: stats.total_admins || 0,
      icon: Shield,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Total Events',
      value: stats.total_events || 0,
      icon: Calendar,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcoming_events || 0,
      icon: Calendar,
      color: 'pink',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Total Jobs',
      value: stats.total_jobs || 0,
      icon: Briefcase,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Active Jobs',
      value: stats.active_jobs || 0,
      icon: Briefcase,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Past Events',
      value: stats.past_events || 0,
      icon: Calendar,
      color: 'gray',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600'
    },
    {
      title: 'Jobs This Month',
      value: stats.jobs_this_month || 0,
      icon: Activity,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Rate</span>
              <span className="text-sm font-semibold text-green-600">
                {stats.total_alumni > 0
                  ? Math.round((stats.active_alumni / stats.total_alumni) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verification Rate</span>
              <span className="text-sm font-semibold text-purple-600">
                {stats.total_alumni > 0
                  ? Math.round((stats.verified_alumni / stats.total_alumni) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Engagement</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Upcoming Events</span>
              <span className="text-sm font-semibold text-indigo-600">
                {stats.upcoming_events}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Past Events</span>
              <span className="text-sm font-semibold text-gray-600">
                {(stats.total_events || 0) - (stats.upcoming_events || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Market</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Jobs</span>
              <span className="text-sm font-semibold text-orange-600">
                {stats.active_jobs}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Jobs This Month</span>
              <span className="text-sm font-semibold text-emerald-600">
                {stats.jobs_this_month || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
