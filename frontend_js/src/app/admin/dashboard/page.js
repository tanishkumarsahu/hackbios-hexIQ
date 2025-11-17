'use client';

import AdminAuthGuard from '../../../components/admin/AdminAuthGuard';
import AdminDashboard from '../../../components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <AdminAuthGuard>
      <AdminDashboard />
    </AdminAuthGuard>
  );
}
