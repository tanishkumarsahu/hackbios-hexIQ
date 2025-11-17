'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import Image from 'next/image';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy'
];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/users',
  '/events',
  '/jobs'
];

export function AuthGuard({ children, requireAuth = true, redirectTo = '/auth/login' }) {
  const { user, isAuthenticated, isInitialized, authState, AUTH_STATES } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // CRITICAL: Check if user is logging out - bypass all checks
        const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
        if (isLoggingOut) {
          console.log('🚪 AuthGuard: Logout in progress, bypassing all checks');
          setIsChecking(false);
          return;
        }

        setIsChecking(true);
        setError(null);

        // Wait for auth to be initialized
        if (!isInitialized) {
          return;
        }

        const isPublicRoute = PUBLIC_ROUTES.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );

        const isProtectedRoute = PROTECTED_ROUTES.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );

        // CRITICAL: Check if authenticated user is disabled
        // Note: The main logout is handled in EnhancedAuthContext
        // This is just a safety check in case user object is stale
        if (requireAuth && isAuthenticated && user?.is_active === false) {
          console.log('🚫 AuthGuard: User is disabled (safety check)');
          // Don't redirect here - let EnhancedAuthContext handle it
          // to avoid duplicate redirects and toasts
          return;
        }

        // If route requires auth but user is not authenticated
        // BUT don't redirect if we're in the middle of a logout process
        if (requireAuth && !isAuthenticated && authState !== AUTH_STATES.LOADING) {
          if (isProtectedRoute) {
            console.log('🔒 AuthGuard: Redirecting unauthenticated user to login');
            const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
            router.push(redirectUrl);
            return;
          }
        } else if (requireAuth && !isAuthenticated && authState === AUTH_STATES.LOADING) {
          console.log('⏳ AuthGuard: Skipping redirect during auth loading (logout in progress)');
        }

        // If user is authenticated but trying to access auth pages
        if (isAuthenticated && isPublicRoute && pathname.startsWith('/auth/')) {
          router.push('/dashboard');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Auth guard error:', error);
        setError(error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, isInitialized, pathname, requireAuth, redirectTo, router, authState]);

  // Show loading state while checking authentication
  // BUT skip if user is logging out
  const isLoggingOut = typeof window !== 'undefined' && sessionStorage.getItem('isLoggingOut') === 'true';
  
  if ((isChecking || !isInitialized || authState === AUTH_STATES.LOADING) && !isLoggingOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-6 mx-auto flex justify-center">
            <div className="relative">
              <Image 
                src="/favicon.png" 
                alt="Loading..." 
                width={80}
                height={80}
                className="object-contain animate-pulse"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-500 text-sm sm:text-base">Please wait while we verify your authentication.</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Something went wrong while checking your authentication status.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                size="default"
              >
                <Shield className="h-4 w-4" />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full sm:w-auto"
                size="default"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return children;
}

// Higher-order component for protecting pages
export function withAuthGuard(Component, options = {}) {
  return function AuthGuardedComponent(props) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

// Hook for checking specific permissions
export function useAuthGuard() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  const requireAuth = (redirectTo = '/auth/login') => {
    if (isInitialized && !isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireRole = (requiredRole, redirectTo = '/unauthorized') => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }

    if (user?.role !== requiredRole) {
      router.push(redirectTo);
      return false;
    }

    return true;
  };

  const requirePermission = (permission, redirectTo = '/unauthorized') => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return false;
    }

    if (!user?.permissions?.includes(permission)) {
      router.push(redirectTo);
      return false;
    }

    return true;
  };

  return {
    requireAuth,
    requireRole,
    requirePermission,
    isAuthenticated,
    user
  };
}
