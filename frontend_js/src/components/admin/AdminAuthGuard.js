'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AUTH_STATES } from '../../contexts/EnhancedAuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminAuthGuard({ children }) {
  const router = useRouter();
  const { user, authState } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const hasCheckedRef = useRef(false);
  const isAuthorizingRef = useRef(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Check if logout is in progress - bypass all checks
      const isLoggingOut = sessionStorage.getItem('isLoggingOut') === 'true';
      if (isLoggingOut) {
        console.log('🚪 AdminAuthGuard: Logout in progress, bypassing all checks');
        setIsChecking(false);
        return;
      }

      // Prevent multiple simultaneous checks
      if (isAuthorizingRef.current) {
        console.log('AdminAuthGuard - Already checking, skipping...');
        return;
      }

      // If already checked and authorized, don't check again
      if (hasCheckedRef.current && isAuthorized) {
        console.log('AdminAuthGuard - Already authorized, skipping check');
        return;
      }

      console.log('AdminAuthGuard - Checking access:', { authState, user, hasChecked: hasCheckedRef.current });

      // Still loading auth state
      if (authState === AUTH_STATES.LOADING) {
        setIsChecking(true);
        return;
      }

      // Not authenticated - redirect to admin login
      if (authState === AUTH_STATES.UNAUTHENTICATED || !user) {
        console.log('Not authenticated - redirecting to /admin/login');
        setIsChecking(false);
        setIsAuthorized(false);
        router.push('/admin/login');
        return;
      }

      // Authenticated - ROBUST check with DB verification
      if (authState === AUTH_STATES.AUTHENTICATED && user) {
        isAuthorizingRef.current = true;
        
        try {
          // TRIPLE CHECK: Memory role, then verify with database
          let isAdmin = user.role === 'admin' || user.role === 'super_admin';
          
          // If role exists in memory and is admin, verify with DB
          if (isAdmin) {
            console.log('Memory role is admin, verifying with database...');
            
            const { data: dbUser, error } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single();
            
            if (!error && dbUser) {
              const dbIsAdmin = dbUser.role === 'admin' || dbUser.role === 'super_admin';
              
              if (dbIsAdmin) {
                console.log('✅ ADMIN ACCESS GRANTED - Verified with database');
                setIsAuthorized(true);
                setIsChecking(false);
                hasCheckedRef.current = true;
                isAuthorizingRef.current = false;
                return;
              } else {
                console.log('❌ Database says not admin - denying access');
                isAdmin = false;
              }
            } else {
              console.error('Error fetching user from DB:', error);
              // If DB check fails but memory says admin, trust memory (network issue)
              console.log('⚠️ DB check failed, trusting memory role');
              setIsAuthorized(true);
              setIsChecking(false);
              hasCheckedRef.current = true;
              isAuthorizingRef.current = false;
              return;
            }
          }
          
          // Not an admin
          if (!isAdmin) {
            console.log('❌ NOT AN ADMIN - Access denied');
            setIsAuthorized(false);
            setIsChecking(false);
            isAuthorizingRef.current = false;
            
            // Only redirect if we haven't checked before (prevent loops)
            if (!hasCheckedRef.current) {
              hasCheckedRef.current = true;
              setTimeout(() => {
                router.push('/admin/login');
              }, 1500);
            }
          }
        } catch (err) {
          console.error('AdminAuthGuard error:', err);
          // On error, if user has admin role in memory, allow access
          if (user.role === 'admin' || user.role === 'super_admin') {
            console.log('⚠️ Error during check, but memory role is admin - allowing access');
            setIsAuthorized(true);
            setIsChecking(false);
          } else {
            setIsAuthorized(false);
            setIsChecking(false);
          }
          isAuthorizingRef.current = false;
        }
      }
    };

    checkAdminAccess();
  }, [user, authState, router]);

  // Loading state
  if (isChecking || authState === AUTH_STATES.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You do not have administrator privileges to access this area.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to admin login...
          </p>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}
