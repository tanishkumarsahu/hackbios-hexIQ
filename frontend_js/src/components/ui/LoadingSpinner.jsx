'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 'default', text = 'Loading...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
