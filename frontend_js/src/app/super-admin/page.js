'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AUTH_STATES } from '../../contexts/EnhancedAuthContext';
import SuperAdminDashboard from '../../components/admin/SuperAdminDashboard';
import { Loader2 } from 'lucide-react';

export default function SuperAdminPage() {
  const { user, authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Super Admin page - Auth state:', authState, 'User:', user);
    // Only super_admin can access
    if (authState === AUTH_STATES.AUTHENTICATED && user) {
      console.log('User role:', user.role);
      if (user.role !== 'super_admin') {
        console.log('Redirecting - not super admin');
        router.push(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } else if (authState === AUTH_STATES.UNAUTHENTICATED) {
      console.log('Redirecting to login - not authenticated');
      router.push('/auth/login');
    }
  }, [user, authState, router]);

  if (authState === AUTH_STATES.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return <SuperAdminDashboard />;
}
