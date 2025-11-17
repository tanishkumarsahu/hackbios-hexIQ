'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { Button } from '../ui/Button';
import { Sidebar } from './Sidebar';
import NotificationBell from '../notifications/NotificationBell';
import { 
  User,
  LogOut,
  Bell,
  Search,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import Logo from '../ui/Logo';
import { Breadcrumb } from '../ui/Breadcrumb';
import { usePathname } from 'next/navigation';

export function Navigation({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    const pathMap = {
      'dashboard': 'Dashboard',
      'profile': 'Profile',
      'alumni': 'Alumni',
      'events': 'Events',
      'jobs': 'Jobs',
      'messages': 'Messages',
      'connections': 'Connections',
      'settings': 'Settings',
      'saved-jobs': 'Saved Jobs'
    };

    pathSegments.forEach((segment, index) => {
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  // Load sidebar preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved !== null) {
      setSidebarExpanded(saved === 'true');
    }
  }, []);

  // Track mobile state and close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (!mobile && mobileOpen) {
        setMobileOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  // Save sidebar preference
  const toggleSidebar = () => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    localStorage.setItem('sidebarExpanded', String(newState));
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Don't redirect here - let the auth context handle it
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Navbar - Full width at top */}
      <header className="bg-white shadow-sm border-b z-20 flex-shrink-0 sticky top-0">
          <div className="px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Section: Hamburger (All Screens) + Logo */}
              <div className="flex items-center gap-4">
              {/* Hamburger - All Screen Sizes */}
              <button
                onClick={() => {
                  if (isMobile) {
                    setMobileOpen(!mobileOpen);
                  } else {
                    toggleSidebar();
                  }
                }}
                className="hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200 flex items-center justify-center"
                aria-label="Toggle menu"
              >
                {(isMobile ? mobileOpen : sidebarExpanded) ? (
                  <X className="h-6 w-6 text-gray-700" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-700" />
                )}
              </button>

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
                <Logo size="default" />
              </Link>
            </div>

            {/* Center Section: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alumni, events, jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Icon - Mobile */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden p-2"
                onClick={() => setSearchExpanded(!searchExpanded)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Profile */}
              <Link href="/profile">
                <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user?.name || 'User'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <span className="hidden lg:block text-sm font-medium truncate max-w-[120px]">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                </Button>
              </Link>

              {/* Logout */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search Expanded */}
          {searchExpanded && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alumni, events, jobs..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content Area Below Navbar - Sidebar + Main Content */}
      <div className="flex relative">
        {/* Breadcrumbs - Above content, with left margin for sidebar */}
        {pathname !== '/dashboard' && getBreadcrumbs().length > 0 && (
          <div 
            className="fixed top-16 right-0 bg-gray-50 border-b border-gray-200 z-[5]"
            style={{
              left: !isMobile ? (sidebarExpanded ? '320px' : '88px') : '0',
              transition: 'left 300ms'
            }}
          >
            <div className="px-4 sm:px-6 lg:px-8 py-3">
              <Breadcrumb items={getBreadcrumbs()} />
            </div>
          </div>
        )}
        {/* Sidebar - Fixed position, doesn't take up layout space */}
        <Sidebar 
          isExpanded={sidebarExpanded}
          onToggle={toggleSidebar}
          isMobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Page Content - Scrollable, with left margin for sidebar on desktop */}
        <main 
          className="flex-1 bg-gray-50 w-full transition-all duration-300"
          style={{
            marginLeft: !isMobile ? (sidebarExpanded ? '320px' : '88px') : '0',
            paddingTop: pathname !== '/dashboard' && getBreadcrumbs().length > 0 ? '3.5rem' : '0'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Navigation;
