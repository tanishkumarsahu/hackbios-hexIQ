import React from 'react';
import Image from 'next/image';

export function LogoLoader({ size = 'default' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} relative animate-pulse`}>
        <Image
          src="/favicon.png"
          alt="Loading..."
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}

export default LogoLoader;
