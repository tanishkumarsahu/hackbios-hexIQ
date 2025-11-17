/**
 * Profile Completion Service
 * Handles profile completion validation, calculation, and database updates
 * Production-ready with comprehensive error handling
 */

import { supabase } from './supabase';

/**
 * MINIMUM REQUIREMENTS FOR PROFILE COMPLETION
 * A profile is considered "complete" when ALL required fields are filled
 */
export const REQUIRED_FIELDS = {
  // Basic Information (MUST HAVE)
  name: { label: 'Full Name', category: 'basic' },
  email: { label: 'Email', category: 'basic' },
  
  // Education (MUST HAVE for alumni)
  graduation_year: { label: 'Graduation Year', category: 'education' },
  degree: { label: 'Degree', category: 'education' },
  major: { label: 'Major/Field of Study', category: 'education' },
};

/**
 * RECOMMENDED FIELDS (Not required but increase completion percentage)
 */
export const RECOMMENDED_FIELDS = {
  phone: { label: 'Phone Number', category: 'basic' },
  location: { label: 'Location', category: 'basic' },
  bio: { label: 'Bio', category: 'basic', minLength: 50 },
  current_title: { label: 'Current Job Title', category: 'professional' },
  current_company: { label: 'Current Company', category: 'professional' },
  avatar_url: { label: 'Profile Picture', category: 'additional' },
  skills: { label: 'Skills', category: 'additional', minItems: 3 },
  interests: { label: 'Interests', category: 'additional', minItems: 2 },
  linkedin_url: { label: 'LinkedIn Profile', category: 'social' },
};

/**
 * Check if a single field is complete
 */
function isFieldComplete(value, fieldConfig) {
  // Handle null/undefined/empty
  if (value === null || value === undefined || value === '') {
    return false;
  }

  // Handle arrays
  if (fieldConfig.minItems !== undefined) {
    if (!Array.isArray(value)) return false;
    return value.length >= fieldConfig.minItems;
  }

  // Handle strings with minimum length
  if (fieldConfig.minLength !== undefined) {
    if (typeof value !== 'string') return false;
    return value.trim().length >= fieldConfig.minLength;
  }

  // Handle regular strings
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return !isNaN(value) && value > 0;
  }

  return Boolean(value);
}

/**
 * Calculate profile completion percentage
 * MUST MATCH utils/profileCompletion.js logic for consistency
 */
export function calculateCompletionPercentage(userData) {
  if (!userData) return 0;

  // Import the same logic from profileCompletion.js
  // Weighted sections: Basic 30%, Education 25%, Professional 25%, Social 10%, Additional 10%
  
  const sections = {
    basic: {
      weight: 30,
      fields: ['name', 'email', 'phone', 'location', 'bio'],
      check: (data) => {
        let count = 0;
        if (data.name?.trim()) count++;
        if (data.email?.trim()) count++;
        if (data.phone?.trim()) count++;
        if (data.location?.trim()) count++;
        if (data.bio?.trim() && data.bio.length >= 50) count++;
        return (count / 5) * 100;
      }
    },
    education: {
      weight: 25,
      fields: ['graduation_year', 'degree', 'major'],
      check: (data) => {
        let count = 0;
        if (data.graduation_year) count++;
        if (data.degree?.trim()) count++;
        if (data.major?.trim()) count++;
        return (count / 3) * 100;
      }
    },
    professional: {
      weight: 25,
      fields: ['current_title', 'current_company'],
      check: (data) => {
        let count = 0;
        if (data.current_title?.trim()) count++;
        if (data.current_company?.trim()) count++;
        return (count / 2) * 100;
      }
    },
    social: {
      weight: 10,
      fields: ['linkedin_url', 'github_url', 'website_url'],
      check: (data) => {
        let count = 0;
        if (data.linkedin_url?.trim()) count++;
        if (data.github_url?.trim()) count++;
        if (data.website_url?.trim()) count++;
        return (count / 3) * 100;
      }
    },
    additional: {
      weight: 10,
      fields: ['avatar_url', 'skills', 'interests'],
      check: (data) => {
        let count = 0;
        if (data.avatar_url?.trim()) count++;
        if (Array.isArray(data.skills) && data.skills.length >= 3) count++;
        if (Array.isArray(data.interests) && data.interests.length >= 2) count++;
        return (count / 3) * 100;
      }
    }
  };

  let weightedSum = 0;
  let totalWeight = 0;

  Object.values(sections).forEach(section => {
    const sectionPercentage = section.check(userData);
    weightedSum += (sectionPercentage / 100) * section.weight;
    totalWeight += section.weight;
  });

  const percentage = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
  return Math.min(100, Math.max(0, percentage));
}

/**
 * Check if profile meets MINIMUM requirements for visibility
 * Returns true only if ALL required fields are complete
 */
export function isProfileComplete(userData) {
  if (!userData) {
    console.log('❌ [isProfileComplete] No user data provided');
    return false;
  }

  console.log('🔍 [isProfileComplete] Checking profile completion for:', userData.email);

  const missingRequired = [];

  // Check ALL required fields
  for (const [key, config] of Object.entries(REQUIRED_FIELDS)) {
    const value = userData[key];
    const complete = isFieldComplete(value, config);
    
    if (!complete) {
      missingRequired.push(config.label);
      console.log(`❌ [isProfileComplete] Missing required field: ${config.label} (${key})`);
    } else {
      console.log(`✅ [isProfileComplete] Has required field: ${config.label}`);
    }
  }

  const isComplete = missingRequired.length === 0;

  if (isComplete) {
    console.log('✅ [isProfileComplete] Profile is COMPLETE');
  } else {
    console.log(`❌ [isProfileComplete] Profile INCOMPLETE. Missing: ${missingRequired.join(', ')}`);
  }

  return isComplete;
}

/**
 * Get missing required fields for user feedback
 */
export function getMissingRequiredFields(userData) {
  if (!userData) return Object.values(REQUIRED_FIELDS);

  const missing = [];

  Object.entries(REQUIRED_FIELDS).forEach(([key, config]) => {
    if (!isFieldComplete(userData[key], config)) {
      missing.push({
        key,
        ...config
      });
    }
  });

  return missing;
}

/**
 * Update profile completion status in database
 * Call this after every profile update
 */
export async function updateProfileCompletionStatus(userId, userData) {
  console.log('🔄 [updateProfileCompletionStatus] Starting for user:', userId);

  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Calculate completion
    const percentage = calculateCompletionPercentage(userData);
    const isComplete = isProfileComplete(userData);

    console.log('📊 [updateProfileCompletionStatus] Completion:', { percentage, isComplete });

    // Update database
    const { data, error } = await supabase
      .from('users')
      .update({
        profile_completion_percentage: percentage,
        profile_completed: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [updateProfileCompletionStatus] Database error:', error);
      throw error;
    }

    console.log('✅ [updateProfileCompletionStatus] Updated successfully:', data);

    return {
      success: true,
      percentage,
      isComplete,
      data
    };

  } catch (error) {
    console.error('💥 [updateProfileCompletionStatus] Error:', error);
    throw error;
  }
}

/**
 * Check if user can send/receive connection requests
 * Returns { canConnect, reason }
 */
export function canUserConnect(userData) {
  const isComplete = isProfileComplete(userData);
  const missingFields = getMissingRequiredFields(userData);

  if (isComplete) {
    return {
      canConnect: true,
      reason: null
    };
  }

  return {
    canConnect: false,
    reason: `Complete your profile to connect with alumni. Missing: ${missingFields.map(f => f.label).join(', ')}`,
    missingFields
  };
}

/**
 * Get user-friendly completion status message
 */
export function getCompletionStatusMessage(userData) {
  const percentage = calculateCompletionPercentage(userData);
  const isComplete = isProfileComplete(userData);
  const missingRequired = getMissingRequiredFields(userData);

  if (isComplete) {
    return {
      type: 'success',
      title: '🎉 Profile Complete!',
      message: 'You can now connect with alumni and appear in the directory.',
      percentage
    };
  }

  if (missingRequired.length > 0) {
    return {
      type: 'warning',
      title: '⚠️ Complete Your Profile',
      message: `Add ${missingRequired.length} required field${missingRequired.length > 1 ? 's' : ''} to unlock full access.`,
      missingFields: missingRequired,
      percentage
    };
  }

  return {
    type: 'info',
    title: '👋 Welcome!',
    message: 'Complete your profile to connect with alumni.',
    percentage
  };
}

export default {
  calculateCompletionPercentage,
  isProfileComplete,
  getMissingRequiredFields,
  updateProfileCompletionStatus,
  canUserConnect,
  getCompletionStatusMessage,
  REQUIRED_FIELDS,
  RECOMMENDED_FIELDS
};
