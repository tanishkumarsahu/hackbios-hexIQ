'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { AuthProvider } from "../../contexts/EnhancedAuthContext";
import { DashboardProvider } from "../../contexts/SimpleDashboardContext";
import { AdminProvider } from "../../contexts/AdminContext";
import { Toaster } from "sonner";
import AOSInit from "../AOSInit";

export function Providers({ children }) {
  return (
    <>
      <AOSInit />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <DashboardProvider>
            <AdminProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                duration={4000}
              />
            </AdminProvider>
          </DashboardProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
}
