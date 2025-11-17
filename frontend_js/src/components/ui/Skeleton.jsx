'use client';

import React from 'react';

// Base Skeleton component
export function Skeleton({ className = '', width, height, circle = false, ...props }) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';
  const shapeClasses = circle ? 'rounded-full' : 'rounded-md';
  
  const style = {
    width: width || '100%',
    height: height || '1rem',
    animation: 'shimmer 2s infinite linear',
  };

  return (
    <div 
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={style}
      {...props}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton height="1.25rem" width="60%" />
            <Skeleton height="0.875rem" width="80%" />
          </div>
          <Skeleton circle width="2rem" height="2rem" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <Skeleton height="0.75rem" width="90%" />
          <Skeleton height="0.75rem" width="70%" />
          <Skeleton height="0.75rem" width="85%" />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton height="1.5rem" width="4rem" />
          <Skeleton height="1.5rem" width="5rem" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="flex items-center gap-3">
            {index === 0 && <Skeleton circle width="2.5rem" height="2.5rem" />}
            <div className="flex-1 space-y-2">
              <Skeleton height="0.875rem" width={index === 0 ? '60%' : '80%'} />
              {index === 0 && <Skeleton height="0.75rem" width="50%" />}
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 5, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <Skeleton height="0.875rem" width="70%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton({ withAvatar = true, className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      {withAvatar && <Skeleton circle width="3rem" height="3rem" />}
      <div className="flex-1 space-y-2">
        <Skeleton height="1rem" width="40%" />
        <Skeleton height="0.875rem" width="60%" />
      </div>
      <Skeleton height="2rem" width="5rem" />
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ items = 5, withAvatar = true, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow divide-y divide-gray-200 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <ListItemSkeleton key={index} withAvatar={withAvatar} />
      ))}
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton height="0.875rem" width="50%" />
          <Skeleton height="2rem" width="40%" />
        </div>
        <Skeleton circle width="3rem" height="3rem" />
      </div>
    </div>
  );
}

// Dashboard Grid Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
