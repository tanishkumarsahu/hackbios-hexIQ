'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { useDashboard } from '../../contexts/SimpleDashboardContext';
import { supabase } from '../../lib/supabase';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { ProfileCompletionCard } from '../../components/profile/ProfileCompletionCard';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  GraduationCap,
  MessageSquare,
  MapPin,
  Camera,
  Coffee,
  Zap,
  Target,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Trophy,
  Globe,
  Network,
  Search,
  CheckCircle,
  UserPlus,
  Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import notificationService from '../../lib/notificationService';
import { usersAPI } from '../../services/api';

function DashboardContent() {
  const { user, logout, isAuthenticated, authState, AUTH_STATES } = useAuth();
  const { stats, recentUsers, loading, loadDashboardData } = useDashboard();
  const router = useRouter();
  const [animatedStats, setAnimatedStats] = useState({ totalUsers: 0, verifiedUsers: 0, activeUsers: 0, events: 0 });
  const [hoveredCard, setHoveredCard] = useState(null);
  const [messagesCount, setMessagesCount] = useState(0);
  const [jobsCount, setJobsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  
  // CRITICAL: Block admins from accessing user dashboard
  const hasRedirectedRef = React.useRef(false);
  
  useEffect(() => {
    const checkAndRedirect = async () => {
      if (hasRedirectedRef.current) return;
      
      if (user && (user.role === 'admin' || user.role === 'super_admin')) {
        console.log('Admin detected on user dashboard - verifying and redirecting');
        
        // Double check with database
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
            console.log('✅ Confirmed admin - redirecting to admin dashboard');
            hasRedirectedRef.current = true;
            router.push('/admin/dashboard');
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          // If check fails but memory says admin, redirect anyway
          hasRedirectedRef.current = true;
          router.push('/admin/dashboard');
        }
      }
    };
    
    checkAndRedirect();
  }, [user, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData(); // This will use cached data if available
      
      // Fetch messages count for current user
      const fetchMessagesCount = async () => {
        try {
          const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
          
          if (!error) {
            setMessagesCount(count || 0);
          }
        } catch (err) {
          console.error('Failed to fetch messages count:', err);
        }
      };
      
      // Fetch jobs count
      const fetchJobsCount = async () => {
        try {
          const { count, error } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
          
          if (!error) {
            setJobsCount(count || 0);
          }
        } catch (err) {
          console.error('Failed to fetch jobs count:', err);
        }
      };
      
      const fetchNotifications = async () => {
        try {
          setNotificationsLoading(true);
          const result = await notificationService.getUserNotifications(user.id, 5);
          if (result.success) {
            setNotifications(result.data || []);
          } else {
            setNotifications([]);
          }
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
          setNotifications([]);
        } finally {
          setNotificationsLoading(false);
        }
      };

      fetchMessagesCount();
      fetchJobsCount();
      fetchNotifications();
    }
  }, [isAuthenticated, user, loadDashboardData]);

  // Animated counter effect
  useEffect(() => {
    if (stats && !loading) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedStats({
          totalUsers: Math.floor(stats.totalUsers * progress),
          verifiedUsers: Math.floor(stats.verifiedUsers * progress),
          activeUsers: Math.floor(stats.activeUsers * progress),
          events: Math.floor(stats.events * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats({
            totalUsers: stats.totalUsers,
            verifiedUsers: stats.verifiedUsers,
            activeUsers: stats.activeUsers,
            events: stats.events
          });
        }
      }, stepDuration);
      
      return () => clearInterval(timer);
    }
  }, [stats, loading]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (authState === AUTH_STATES.LOADING || loading) {
    return (
      <Navigation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      {/* Streamlined Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6" data-aos="zoom-out">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Alumni'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {stats?.totalUsers > 0 
                  ? `${stats.totalUsers} alumni in your network` 
                  : 'Start building your alumni network'}
              </p>
            </div>
            <Button 
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto flex-shrink-0"
              size="sm"
            >
              <span className="sm:hidden">Profile</span>
              <span className="hidden sm:inline">Complete Profile</span>
            </Button>
          </div>
          
          {/* Horizontal Stats Bar - Scrollable on Mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide" data-aos="zoom-out" data-aos-delay="50">
            <div className="flex items-center gap-4 sm:gap-6 text-sm min-w-max">
              <button 
                onClick={() => router.push('/alumni')}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">{animatedStats.totalUsers.toLocaleString()}</span>
                <span className="text-gray-500 hidden sm:inline">Alumni</span>
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => router.push('/alumni')}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">{animatedStats.verifiedUsers.toLocaleString()}</span>
                <span className="text-gray-500 hidden sm:inline">Verified</span>
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => router.push('/events')}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{animatedStats.events}</span>
                <span className="text-gray-500 hidden sm:inline">Events</span>
              </button>
              <span className="text-gray-300">•</span>
              <button 
                onClick={() => router.push('/messages')}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">{messagesCount}</span>
                <span className="text-gray-500 hidden sm:inline">Messages</span>
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Primary Column (70%) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Smart Recommendations */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out" data-aos-delay="50">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg md:text-xl sm:text-base font-bold text-gray-900 leading-tight " style={{ fontSize: '1.5rem', lineHeight: '1.2'}}>
                      Alumni you should connect with
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block leading-tight" style={{ lineHeight: '1.3' }}>Based on shared interests and background</CardDescription>
                  </div>
                  <Button   
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push('/alumni')}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mt-1 flex-shrink-0 font-medium"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recentUsers && recentUsers.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentUsers.slice(0, 3).map((alumni, index) => (
                    <div 
                      key={alumni.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4 hover:bg-blue-50/50 transition-all duration-200 group gap-3 cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                      data-aos="zoom-out"
                      data-aos-delay={100 + (index * 30)}
                      onClick={() => router.push('/alumni')}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                            {alumni.avatar_url ? (
                              <img 
                                src={alumni.avatar_url} 
                                alt={alumni.name}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span className={`text-white font-bold text-base ${alumni.avatar_url ? 'hidden' : 'flex'}`}>
                              {alumni.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          {/* Verified Badge */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" fill="currentColor" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{alumni.name}</h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                            {alumni.current_title && alumni.current_company 
                              ? `${alumni.current_title} at ${alumni.current_company}`
                              : alumni.current_title || alumni.current_company || 'Alumni'
                            }
                          </p>
                          {(alumni.degree || alumni.graduation_year) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <GraduationCap className="h-3 w-3 text-blue-600" />
                              <p className="text-xs text-gray-500">
                                {alumni.degree && alumni.graduation_year 
                                  ? `${alumni.degree} • Class of ${alumni.graduation_year}`
                                  : alumni.degree || `Class of ${alumni.graduation_year}`
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 sm:ml-4 flex-shrink-0 w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle connect logic here
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Connect
                      </Button>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 font-medium">No verified alumni yet</p>
                    <p className="text-xs text-gray-500 mt-1">Check back soon for alumni recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out" data-aos-delay="100">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-sm sm:text-base font-bold text-gray-900">
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">Updates from your network</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <div className="flex items-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs animate-spin-reverse">
                        SC
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-900"><span className="font-medium">Sarah Chen</span> changed jobs to Senior Product Manager at Google</p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs animate-spin-reverse">
                        MJ
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-900"><span className="font-medium">Marcus Johnson</span> is attending Alumni Tech Meetup</p>
                      <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs animate-spin-reverse">
                        PP
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-900"><span className="font-medium">Priya Patel</span> posted in Machine Learning group</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out" data-aos-delay="150">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base font-bold text-gray-900">
                      Upcoming Events
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Don't miss out on networking opportunities</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push('/events')} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 -mt-1 flex-shrink-0 font-medium">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-all duration-200 group">
                    <h4 className="font-semibold text-gray-900 text-sm">Alumni Tech Meetup</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5">Dec 15, 2025 • 6:00 PM</p>
                    <p className="text-xs text-gray-500 mt-1">San Francisco, CA</p>
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <span className="text-xs text-gray-600">47 attending</span>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs">RSVP</Button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white hover:bg-gray-50 transition-all duration-200 group">
                    <h4 className="font-semibold text-gray-900 text-sm">Career Development Workshop</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1.5">Dec 20, 2025 • 2:00 PM</p>
                    <p className="text-xs text-gray-500 mt-1">Virtual Event</p>
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      <span className="text-xs text-gray-600">89 attending</span>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs">RSVP</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Column (30%) */}
          <div className="space-y-6">
            
            {/* Profile Completion Card */}
            <div data-aos="zoom-out-left" data-aos-delay="50">
              <ProfileCompletionCard user={user} variant="compact" />
            </div>
            
            <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out-left" data-aos-delay="75">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-sm sm:text-base font-bold text-gray-900">
                    Notifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 sm:px-6 py-6 text-center text-sm text-gray-500">
                    You're all caught up. No new notifications.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                          !notification.is_read ? 'bg-blue-50/40' : ''
                        }`}
                        onClick={() => {
                          if (!notification.is_read) {
                            notificationService.markAsRead(notification.id).then(() => {
                              setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                            });
                          }
                          if (notification.link) {
                            router.push(notification.link);
                          }
                        }}
                      >
                        <div className="mt-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-600" hidden={notification.is_read} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[11px] text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl  border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out-left" data-aos-delay="100">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-sm sm:text-base font-bold text-gray-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/alumni');
                    }}
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0 shadow-sm group-hover:shadow-md">
                        <Search className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Find Alumni</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{animatedStats.totalUsers.toLocaleString()}</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/events');
                    }}
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0 shadow-sm group-hover:shadow-md">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Browse Events</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{animatedStats.events}</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/jobs');
                    }}
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0 shadow-sm group-hover:shadow-md">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Job Board</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{jobsCount}</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/messages');
                    }}
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0 shadow-sm group-hover:shadow-md">
                        <MessageSquare className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Messages</span>
                    </div>
                    <span className="text-xs text-blue-600 font-medium flex-shrink-0">{messagesCount}</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Network Insights */}
            <Card className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white" data-aos="zoom-out-left" data-aos-delay="150">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
                <CardTitle className="text-sm sm:text-base font-bold text-gray-900">
                  Network Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200">
                    <span className="text-xs sm:text-sm text-gray-600">Network growth</span>
                    <span className="text-xs sm:text-sm font-medium text-green-600 flex-shrink-0">+12 this month</span>
                  </div>
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200">
                    <span className="text-xs sm:text-sm text-gray-600">Most common industry</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 flex-shrink-0">Technology (45%)</span>
                  </div>
                  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-all duration-200 group">
                    <span className="text-xs sm:text-sm text-gray-600">Alumni in your city</span>
                    <button className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0">
                      23 <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Navigation>
  );
}

// Export dashboard wrapped with AuthGuard for better security
export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <DashboardContent />
    </AuthGuard>
  );
}
