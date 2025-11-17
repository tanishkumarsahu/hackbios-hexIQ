'use client';

import React from 'react';
import { getPasswordStrength, getPasswordStrengthLabel } from '../../lib/utils';

export function PasswordStrength({ password, showRequirements = true }) {
  const { score } = getPasswordStrength(password);
  const { label, color } = getPasswordStrengthLabel(score);

  // Calculate strength level (0-3)
  const strengthLevel = score <= 2 ? 1 : score <= 4 ? 2 : 3;

  // Check individual requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isLongEnough = password.length >= 6;

  const allRequirementsMet = hasLowercase && hasUppercase && hasNumber && hasSymbol && isLongEnough;

  const getBarColor = (barIndex) => {
    if (barIndex > strengthLevel) return 'bg-gray-200';
    
    switch (strengthLevel) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getTextColor = () => {
    switch (strengthLevel) {
      case 1: return 'text-red-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Three Strength Bars - Full Width */}
      <div className="flex gap-1.5 w-full">
        {[1, 2, 3].map((barIndex) => (
          <div
            key={barIndex}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${getBarColor(barIndex)}`}
          />
        ))}
      </div>
      
      {/* Strength Label and Requirements */}
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs leading-tight font-medium transition-colors ${
          allRequirementsMet ? 'text-green-600' : 'text-red-600'
        }`}>
          Must have: lowercase, UPPERCASE, number, symbol (!@#$)
        </p>
        <span className={`text-xs font-semibold whitespace-nowrap ${getTextColor()}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default PasswordStrength;
