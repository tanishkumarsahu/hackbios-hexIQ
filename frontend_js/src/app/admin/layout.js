'use client';

import { AdminProvider } from '../../contexts/AdminContext';

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
