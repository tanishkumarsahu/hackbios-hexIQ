'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CatchAll() {
  const router = useRouter();

  useEffect(() => {
    // Check if URL has Supabase auth hash fragment
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      
      // Don't redirect admin routes - they should be handled by their own pages
      if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
        console.log('Admin route detected, not redirecting');
        return;
      }
      
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        console.log('Detected Supabase auth callback, redirecting to /auth/callback');
        // Redirect to proper callback handler with hash preserved
        window.location.href = `/auth/callback${hash}`;
      } else {
        // No auth hash, redirect to home or 404
        router.push('/');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
          <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p className="text-gray-500 text-sm">Please wait...</p>
      </div>
    </div>
  );
}
