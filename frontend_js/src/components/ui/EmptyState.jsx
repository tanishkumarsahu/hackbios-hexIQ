'use client';

import React from 'react';
import { Button } from './Button';

/**
 * EmptyState Component
 * Professional empty state with icon, title, description, and optional action
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  variant = 'default', // default, minimal, card
}) {
  const containerClasses = {
    default: 'bg-white rounded-xl border-2 border-dashed border-gray-300 p-12',
    minimal: 'p-12',
    card: 'bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-12 shadow-sm',
  };

  return (
    <div className={`text-center ${containerClasses[variant]} ${className}`}>
      {/* Icon */}
      {Icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
          <Icon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 max-w-sm mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              className="w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Specialized Empty States for common scenarios
 */

// No Search Results
export function NoSearchResults({ searchTerm, onClear }) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )}
      title="No results found"
      description={searchTerm ? `No results match "${searchTerm}". Try adjusting your search or filters.` : 'Try adjusting your search or filters.'}
      actionLabel={onClear ? "Clear filters" : undefined}
      onAction={onClear}
      variant="minimal"
    />
  );
}

// No Data Yet
export function NoDataYet({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant="card"
    />
  );
}

// Error State
export function ErrorState({ 
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry
}) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      title={title}
      description={description}
      actionLabel="Try again"
      onAction={onRetry}
      variant="default"
    />
  );
}

// Coming Soon
export function ComingSoon({ 
  title = "Coming Soon",
  description = "This feature is currently under development. Stay tuned!"
}) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )}
      title={title}
      description={description}
      variant="card"
    />
  );
}

// Access Denied
export function AccessDenied({ 
  title = "Access Denied",
  description = "You don't have permission to view this content.",
  onGoBack
}) {
  return (
    <EmptyState
      icon={({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
      title={title}
      description={description}
      actionLabel={onGoBack ? "Go back" : undefined}
      onAction={onGoBack}
      variant="default"
    />
  );
}

export default EmptyState;
