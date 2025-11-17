'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthGuard from '../../components/admin/AdminAuthGuard';
import AdminDashboard from '../../components/admin/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();

  // Redirect /admin to /admin/dashboard
  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}
