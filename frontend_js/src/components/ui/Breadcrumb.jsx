'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb({ items = [], className = '' }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link 
        href="/" 
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            
            {isLast || !item.href ? (
              <span className="font-medium text-gray-900 truncate">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="text-gray-500 hover:text-gray-700 transition-colors truncate">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
