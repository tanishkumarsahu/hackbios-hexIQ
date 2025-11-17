'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Star,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { calculateProfileCompletion, getCompletionMessage, getCompletionColor } from '../../utils/profileCompletion';

const ICON_MAP = {
  User,
  GraduationCap,
  Briefcase,
  Globe,
  Star
};

export function ProfileCompletionCard({ user, variant = 'default' }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate completion data
  const completionData = useMemo(() => {
    return calculateProfileCompletion(user);
  }, [user]);

  const { overallPercentage, sections, nextSteps, isComplete } = completionData;
  const message = getCompletionMessage(overallPercentage);
  const colorScheme = getCompletionColor(overallPercentage);

  // Color mappings for different completion levels
  const colors = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      progress: 'bg-green-500',
      border: 'border-green-200',
      ring: 'ring-green-500'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      progress: 'bg-blue-500',
      border: 'border-blue-200',
      ring: 'ring-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      progress: 'bg-yellow-500',
      border: 'border-yellow-200',
      ring: 'ring-yellow-500'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      progress: 'bg-orange-500',
      border: 'border-orange-200',
      ring: 'ring-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      progress: 'bg-red-500',
      border: 'border-red-200',
      ring: 'ring-red-500'
    }
  };

  const currentColors = colors[colorScheme];

  // Compact variant for dashboard
  if (variant === 'compact') {
    return (
      <Card className="rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center`}>
                  <TrendingUp className={`h-6 w-6 text-blue-600`} />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{message.title}</h3>
                <p className="text-sm text-gray-600">{message.message}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{overallPercentage}%</div>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-blue-400 transition-all duration-500 ease-out`}
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          {/* Quick Actions */}
          {!isComplete && nextSteps.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Next Steps:</p>
              {nextSteps.slice(0, 2).map((step, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{step.action}</span>
                </div>
              ))}
            </div>
          )}

          <Button 
            onClick={() => router.push('/profile')}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {isComplete ? 'View Profile' : 'Complete Profile'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full variant for profile page sidebar
  return (
    <Card className="border-2 border-blue-100 sticky top-24">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-blue-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center`}>
              {isComplete ? (
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              ) : (
                <Sparkles className={`h-7 w-7 ${currentColors.text}`} />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{message.title}</CardTitle>
              <p className="text-xs text-gray-600 mt-0.5">{message.message}</p>
            </div>
          </div>
        </div>
        <div className="text-center mt-3">
          <div className="text-3xl font-bold text-blue-600">{overallPercentage}%</div>
          <p className="text-xs text-gray-500">Complete</p>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Section Breakdown */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Profile Sections</h4>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isExpanded ? 'Show Less' : 'Show All'}
            </button>
          </div>

          <div className="space-y-2">
            {Object.entries(sections).map(([key, section], index) => {
              const Icon = ICON_MAP[section.icon] || User;
              const shouldShow = isExpanded || index < 5;

              if (!shouldShow) return null;

              return (
                <div 
                  key={key}
                  className="group p-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 ${section.isComplete ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {section.isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Icon className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-900">{section.label}</span>
                        <span className={`text-xs font-semibold ${section.isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                          {section.percentage}%
                        </span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${section.isComplete ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500`}
                          style={{ width: `${section.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {!section.isComplete && section.missingFields.length > 0 && (
                    <div className="ml-10 mt-1.5">
                      <p className="text-xs text-red-600 font-medium">
                        Missing: {section.missingFields.slice(0, 2).map(f => f.label).join(', ')}
                        {section.missingFields.length > 2 && ` +${section.missingFields.length - 2}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps - Compact */}
        {!isComplete && nextSteps.length > 0 && (
          <div className={`p-3 ${currentColors.bg} rounded-lg border ${currentColors.border}`}>
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Next Steps
            </h4>
            <div className="space-y-2">
              {nextSteps.slice(0, 3).map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full ${
                    step.priority === 'high' ? 'bg-red-500' :
                    step.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  } flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900">{step.action}</p>
                    {step.fields && step.fields.length > 0 && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {step.fields.slice(0, 2).map(f => f.label).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {isComplete && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-900">Profile Complete!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your profile is fully optimized and visible to other alumni. Great job!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
