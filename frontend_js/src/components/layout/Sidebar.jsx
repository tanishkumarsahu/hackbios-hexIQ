'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Users, 
  Calendar, 
  MessageSquare, 
  Briefcase,
  Bookmark,
  User,
  Settings,
  X,
  LogOut
} from 'lucide-react';

// Sidebar width constants
const SIDEBAR_WIDTH = {
  COLLAPSED: 88,    // Optimal for icon-only display
  EXPANDED: 320,    // Full width with labels
  MOBILE: 340       // Mobile overlay width
};

const ANIMATION_DURATION = 300;

const mainNavItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Alumni Directory',
    href: '/alumni',
    icon: Users,
    badge: null
  },
  {
    name: 'Events',
    href: '/events',
    icon: Calendar,
    badge: null
  },
  {
    name: 'Connections',
    href: '/connections',
    icon: Users,
    badge: null
  },
  {
    name: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: null // Will be dynamically updated
  },
  {
    name: 'Job Board',
    href: '/jobs',
    icon: Briefcase,
    badge: null
  },
  {
    name: 'Saved Jobs',
    href: '/saved-jobs',
    icon: Bookmark,
    badge: null
  }
];

const bottomNavItems = [
    {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null
  }
];

export function Sidebar({ isExpanded, onToggle, isMobileOpen, onMobileClose, user, onLogout }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine if sidebar should show expanded
  const shouldShowExpanded = useMemo(() => {
    return isMobile ? isMobileOpen : isExpanded;
  }, [isMobile, isMobileOpen, isExpanded]);

  // Calculate sidebar width
  const sidebarWidth = useMemo(() => {
    if (isMobile) return SIDEBAR_WIDTH.MOBILE;
    return shouldShowExpanded ? SIDEBAR_WIDTH.EXPANDED : SIDEBAR_WIDTH.COLLAPSED;
  }, [isMobile, shouldShowExpanded]);

  // Initialize and track mobile state
  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change (mobile)
  const prevPathnameRef = React.useRef(pathname);
  useEffect(() => {
    // Only close if pathname actually changed (not on initial mount or state changes)
    if (pathname !== prevPathnameRef.current) {
      if (isMobile && isMobileOpen) {
        onMobileClose();
      }
      prevPathnameRef.current = pathname;
    }
  }, [pathname, isMobile, isMobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen, isMobile]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isMobile && isMobileOpen) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isMobile, isMobileOpen, onMobileClose]);

  // Mobile header component

  const MobileHeader = useCallback(() => (
    <div className="border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 h-16 sticky top-0 bg-background z-10">
      <h2 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Menu</h2>
      <button
        onClick={onMobileClose}
        className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
        aria-label="Close sidebar"
      >
        <X className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  ), [onMobileClose]);

  const NavItem = useCallback(({ item }) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    
    return (
      <Link
        href={item.href}
        className={`
          relative flex items-center py-1 rounded-lg
          transition-all duration-300 ease-in-out
          hover:scale-105 h-11
          ${isActive 
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
            : 'text-gray-700 hover:bg-blue-100/70 hover:text-blue-600 active:bg-blue-100/60'
          }
          ${!shouldShowExpanded ? 'justify-center px-0' : 'px-4 gap-3'}
          group/item touch-manipulation
        `}
        title={!shouldShowExpanded ? item.name : ''}
      >
        {/* Icon - centered when collapsed, left-aligned when expanded */}
        <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-300 ${!shouldShowExpanded ? 'w-full' : 'w-6'}`}>
          <Icon 
            className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-600 group-hover/item:text-blue-600'}`}
            strokeWidth={2}
          />
        </div>
        
        {/* Text label - Smooth fade and slide animation */}
        <span 
          className={`
            font-medium text-base whitespace-nowrap overflow-hidden
            transition-all duration-300 ease-in-out
            ${!shouldShowExpanded ? 'w-0 opacity-0 translate-x-2' : 'w-auto opacity-100 translate-x-0'}
          `}
        >
          {item.name}
        </span>
        
        {/* Badge */}
        {item.badge && shouldShowExpanded && (
          <span className="ml-auto bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {item.badge}
          </span>
        )}
        
        {/* Tooltip for collapsed state */}
        {!shouldShowExpanded && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded opacity-0 group-hover/item:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150 shadow-lg">
            {item.name}
            {item.badge && (
              <span className="ml-2 bg-red-600 px-1.5 py-0.5 rounded-full text-xs">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  }, [pathname, shouldShowExpanded]);

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop - Mobile/Tablet Only */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          style={{
            animation: 'fadeIn 200ms ease-out'
          }}
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar - White Theme */}
      <aside
        className={`
          bg-white border-r border-gray-200
          flex flex-col shadow-2xl
          ${isMobile 
            ? `fixed top-0 left-0 bottom-0 h-screen z-50 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : 'fixed left-0 flex-shrink-0 z-20'
          }
        `}
        style={{
          transition: isMobile 
            ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)` 
            : `width ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
          width: `${sidebarWidth}px`,
          height: isMobile ? '100vh' : 'calc(100vh - 64px)',
          top: isMobile ? '0' : '64px',
          visibility: mounted ? 'visible' : 'hidden',
          transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
          willChange: isMobile ? 'transform' : 'width'
        }}
        data-mobile={isMobile}
        data-open={isMobileOpen}
      >
        {/* Header - Mobile Close Only (no desktop toggle) */}
        {isMobile && <MobileHeader />}

        {/* Main Navigation - Fixed at Top */}
        <nav className="flex-shrink-0 px-2 py-2 space-y-4">
          {mainNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Spacer - Takes Remaining Space */}
        <div className="flex-1 min-h-0" />

        {/* Bottom Navigation - Fixed at Bottom */}
        <div className="border-t border-gray-200 px-3 py-2 space-y-1 flex-shrink-0">
          {bottomNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* User Profile & Logout Section - Unified */}
        <div className="border-t border-gray-200 flex-shrink-0 p-2.5 bg-gray-50/50">
          <div className={`
            flex items-center rounded-xl bg-white border border-gray-200/60
            shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden
            ${!shouldShowExpanded ? 'flex-col p-2 gap-2' : 'p-2 gap-2'}
          `}>
            {/* Profile Button */}
            <Link
              href="/profile"
              className={`
                relative flex items-center rounded-lg
                transition-all duration-300 ease-in-out
                hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                ${!shouldShowExpanded ? 'justify-center w-full h-11' : 'flex-1 h-11 px-2 gap-2 min-w-0'}
                group/profile
              `}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white bg-gradient-to-br from-blue-500 to-purple-600">
                {user?.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user?.name || 'User'}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" strokeWidth={2.5} />
                )}
              </div>
              
              {/* User Info */}
              {shouldShowExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-s font-bold text-gray-900 truncate leading-tight">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate font-medium leading-tight">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {!shouldShowExpanded && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/profile:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150 shadow-xl">
                  Profile
                </div>
              )}
            </Link>
            
            {/* Divider */}
            {shouldShowExpanded && (
              <div className="w-px h-9 bg-gray-200 flex-shrink-0"></div>
            )}
            
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className={`
                relative flex items-center justify-center rounded-lg h-11 w-11
                transition-all duration-300 ease-in-out flex-shrink-0
                text-red-600 hover:bg-red-50 hover:scale-105
                group/logout
              `}
              title="Logout"
            >
              {/* Icon */}
              <LogOut className="h-5 w-5" strokeWidth={2.5} />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/logout:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-150 shadow-xl">
                Logout
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
