'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { 
  getCompletionStatusMessage, 
  getMissingRequiredFields 
} from '../../lib/profileCompletionService';

/**
 * Profile Completion Banner
 * Shows completion status and prompts user to complete profile
 * Displays on dashboard and other pages when profile is incomplete
 */
export function ProfileCompletionBanner({ user, className = '' }) {
  const router = useRouter();

  if (!user) return null;

  const statusMessage = getCompletionStatusMessage(user);
  const missingFields = getMissingRequiredFields(user);
  const isComplete = missingFields.length === 0;

  // Don't show banner if profile is complete
  if (isComplete) return null;

  const handleCompleteProfile = () => {
    router.push('/profile');
  };

  return (
    <Card className={`border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 ${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-orange-600" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {statusMessage.title}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                {statusMessage.percentage}% Complete
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3">
              {statusMessage.message}
            </p>

            {/* Missing Fields */}
            {missingFields.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Required fields to complete:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingFields.map((field) => (
                    <span
                      key={field.key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-orange-200 text-orange-700"
                    >
                      {field.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions Notice */}
            <div className="bg-white border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Currently Restricted:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Cannot send or receive connection requests</li>
                    <li>Not visible in alumni directory</li>
                    <li>Cannot participate in networking features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleCompleteProfile}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Complete Your Profile
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Compact version for smaller spaces
 */
export function ProfileCompletionAlert({ user, onComplete }) {
  if (!user) return null;

  const missingFields = getMissingRequiredFields(user);
  const isComplete = missingFields.length === 0;

  if (isComplete) return null;

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-orange-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-orange-700">
            Complete your profile to unlock all features.{' '}
            <button
              onClick={onComplete}
              className="font-medium underline hover:text-orange-800"
            >
              Complete now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletionBanner;
