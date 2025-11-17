/**
 * Profile Completion Utility
 * Calculates profile completion percentage and identifies missing fields
 * UX-focused with clear categorization and actionable insights
 */

// Profile field categories with weights and user-friendly labels
export const PROFILE_SECTIONS = {
  BASIC: {
    label: 'Basic Information',
    weight: 30,
    icon: 'User',
    fields: [
      { key: 'name', label: 'Full Name', required: true },
      { key: 'email', label: 'Email Address', required: true },
      { key: 'phone', label: 'Phone Number', required: false },
      { key: 'location', label: 'Location', required: false },
      { key: 'bio', label: 'Bio', required: false, minLength: 50 }
    ]
  },
  EDUCATION: {
    label: 'Education',
    weight: 25,
    icon: 'GraduationCap',
    fields: [
      { key: 'graduation_year', label: 'Graduation Year', required: true },
      { key: 'degree', label: 'Degree', required: true },
      { key: 'major', label: 'Major/Field of Study', required: true }
    ]
  },
  PROFESSIONAL: {
    label: 'Professional',
    weight: 25,
    icon: 'Briefcase',
    fields: [
      { key: 'current_title', label: 'Current Job Title', required: false },
      { key: 'current_company', label: 'Current Company', required: false }
    ]
  },
  SOCIAL: {
    label: 'Social Links',
    weight: 10,
    icon: 'Globe',
    fields: [
      { key: 'linkedin_url', label: 'LinkedIn Profile', required: false },
      { key: 'github_url', label: 'GitHub Profile', required: false },
      { key: 'website_url', label: 'Personal Website', required: false }
    ]
  },
  ADDITIONAL: {
    label: 'Additional Info',
    weight: 10,
    icon: 'Star',
    fields: [
      { key: 'avatar_url', label: 'Profile Picture', required: false },
      { key: 'skills', label: 'Skills', required: false, isArray: true, minItems: 3 },
      { key: 'interests', label: 'Interests', required: false, isArray: true, minItems: 2 }
    ]
  }
};

/**
 * Check if a field is complete based on its type and requirements
 */
function isFieldComplete(value, fieldConfig) {
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return false;
  }

  // Handle arrays
  if (fieldConfig.isArray) {
    if (!Array.isArray(value)) return false;
    if (fieldConfig.minItems && value.length < fieldConfig.minItems) return false;
    return value.length > 0;
  }

  // Handle strings with minimum length
  if (fieldConfig.minLength) {
    return typeof value === 'string' && value.trim().length >= fieldConfig.minLength;
  }

  // Handle regular strings
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return true;
  }

  return Boolean(value);
}

/**
 * Calculate completion for a specific section
 */
function calculateSectionCompletion(userData, section) {
  const { fields } = section;
  let completedFields = 0;
  let totalFields = fields.length;
  const missingFields = [];
  const completedFieldsList = [];

  fields.forEach(field => {
    const value = userData[field.key];
    const isComplete = isFieldComplete(value, field);

    if (isComplete) {
      completedFields++;
      completedFieldsList.push(field);
    } else {
      missingFields.push(field);
    }
  });

  const percentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

  return {
    percentage: Math.round(percentage),
    completedFields,
    totalFields,
    missingFields,
    completedFieldsList,
    isComplete: percentage === 100
  };
}

/**
 * Calculate overall profile completion
 * Returns detailed breakdown for UX purposes
 */
export function calculateProfileCompletion(userData) {
  if (!userData) {
    return {
      overallPercentage: 0,
      sections: {},
      totalMissingFields: 0,
      nextSteps: [],
      isComplete: false
    };
  }

  const sections = {};
  let weightedSum = 0;
  let totalWeight = 0;
  let allMissingFields = [];

  // Calculate each section
  Object.entries(PROFILE_SECTIONS).forEach(([key, section]) => {
    const sectionResult = calculateSectionCompletion(userData, section);
    sections[key] = {
      ...sectionResult,
      label: section.label,
      weight: section.weight,
      icon: section.icon
    };

    // Calculate weighted percentage
    weightedSum += (sectionResult.percentage / 100) * section.weight;
    totalWeight += section.weight;

    // Collect missing fields
    allMissingFields = [...allMissingFields, ...sectionResult.missingFields];
  });

  const overallPercentage = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;

  // Generate next steps (prioritize required fields and high-impact sections)
  const nextSteps = generateNextSteps(sections, allMissingFields);

  return {
    overallPercentage,
    sections,
    totalMissingFields: allMissingFields.length,
    nextSteps,
    isComplete: overallPercentage === 100,
    allMissingFields
  };
}

/**
 * Generate actionable next steps for the user
 * Prioritizes required fields and high-impact sections
 */
function generateNextSteps(sections, missingFields) {
  const steps = [];

  // Priority 1: Required fields from high-weight sections
  const requiredMissing = missingFields.filter(f => f.required);
  if (requiredMissing.length > 0) {
    steps.push({
      priority: 'high',
      action: 'Complete required information',
      fields: requiredMissing.slice(0, 3),
      impact: 'Required for full profile access'
    });
  }

  // Priority 2: Complete sections that are almost done
  Object.entries(sections).forEach(([key, section]) => {
    if (section.percentage >= 50 && section.percentage < 100) {
      steps.push({
        priority: 'medium',
        action: `Finish ${section.label}`,
        fields: section.missingFields.slice(0, 2),
        impact: `${100 - section.percentage}% away from completion`
      });
    }
  });

  // Priority 3: Start incomplete sections
  Object.entries(sections).forEach(([key, section]) => {
    if (section.percentage === 0 && section.missingFields.length > 0) {
      steps.push({
        priority: 'low',
        action: `Add ${section.label}`,
        fields: section.missingFields.slice(0, 2),
        impact: 'Enhance your profile visibility'
      });
    }
  });

  return steps.slice(0, 5); // Return top 5 steps
}

/**
 * Get a motivational message based on completion percentage
 */
export function getCompletionMessage(percentage) {
  if (percentage === 100) {
    return {
      title: '🎉 Profile Complete!',
      message: 'Your profile is fully optimized. Great job!',
      tone: 'success'
    };
  } else if (percentage >= 80) {
    return {
      title: '🌟 Almost There!',
      message: 'Just a few more details to complete your profile.',
      tone: 'info'
    };
  } else if (percentage >= 50) {
    return {
      title: '👍 Good Progress!',
      message: 'You\'re halfway there. Keep going!',
      tone: 'info'
    };
  } else if (percentage >= 25) {
    return {
      title: '🚀 Getting Started',
      message: 'Add more details to unlock full features.',
      tone: 'warning'
    };
  } else {
    return {
      title: 'Welcome!',
      message: 'Complete your profile to connect with alumni.',
      tone: 'warning'
    };
  }
}

/**
 * Get color scheme based on completion percentage
 */
export function getCompletionColor(percentage) {
  if (percentage === 100) return 'green';
  if (percentage >= 75) return 'blue';
  if (percentage >= 50) return 'yellow';
  if (percentage >= 25) return 'orange';
  return 'red';
}
