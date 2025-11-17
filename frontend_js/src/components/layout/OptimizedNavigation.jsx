'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { OptimizedSidebar } from './OptimizedSidebar';
import { 
  User,
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';

// ============================================================================
// MEMOIZED SUB-COMPONENTS
// ============================================================================

const SearchBar = memo(({ className = '' }) => (
  <div className={`relative w-full ${className}`}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    <input
      type="text"
      placeholder="Search alumni, events, jobs..."
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-shadow"
      aria-label="Search"
    />
  </div>
));

SearchBar.displayName = 'SearchBar';

const UserMenu = memo(({ user, onLogout }) => (
  <>
    {/* User Profile */}
    <Link href="/profile">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 px-2 sm:px-3 hover:bg-gray-50 transition-colors"
        aria-label="View profile"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <span className="hidden lg:block text-sm font-medium truncate max-w-[120px]">
          {user?.name || user?.email?.split('@')[0] || 'User'}
        </span>
      </Button>
    </Link>

    {/* Logout Button */}
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onLogout}
      className="hidden sm:flex items-center gap-2 hover:bg-gray-50 transition-colors"
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden md:inline">Logout</span>
    </Button>
  </>
));

UserMenu.displayName = 'UserMenu';

// ============================================================================
// MAIN NAVIGATION COMPONENT
// ============================================================================

export function OptimizedNavigation({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // State
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load sidebar preference from localStorage
  useEffect(() => {
    if (!isClient) return;
    
    const saved = localStorage.getItem('sidebarExpanded');
    if (saved !== null) {
      setSidebarExpanded(saved === 'true');
    }
  }, [isClient]);

  // Auto-close mobile menu on desktop resize
  useEffect(() => {
    if (!isClient) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen, isClient]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleSidebar = useCallback(() => {
    const newState = !sidebarExpanded;
    setSidebarExpanded(newState);
    if (isClient) {
      localStorage.setItem('sidebarExpanded', String(newState));
    }
  }, [sidebarExpanded, isClient]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setSearchExpanded(prev => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      // Don't redirect here - let the auth context handle it
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Top Navbar */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Hamburger - All Screen Sizes */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            <Logo size="default" />
          </div>

          {/* Center: Search Bar (Desktop) */}
          <SearchBar className="hidden md:flex flex-1 max-w-md mx-8" />

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Icon (Mobile) */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden p-2 hover:bg-gray-100 transition-colors"
                onClick={toggleSearch}
                aria-label="Toggle search"
                aria-expanded={searchExpanded}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative p-2 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span 
                  className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
                  aria-label="You have unread notifications"
                />
              </Button>

            {/* User Menu */}
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Main Content Area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <OptimizedSidebar 
          isExpanded={sidebarExpanded}
          onToggle={toggleSidebar}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        {/* Page Content */}
        <main 
          className="flex-1 overflow-auto bg-gray-50 w-full lg:w-auto"
          role="main"
        >
          {children}
        </main>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 200ms ease-out;
        }
      `}</style>
    </div>
  );
}

export default OptimizedNavigation;
