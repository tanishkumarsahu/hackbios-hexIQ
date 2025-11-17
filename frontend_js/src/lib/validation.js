// Enhanced validation utilities with comprehensive error handling

export const VALIDATION_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_NAME: 'Name must be at least 2 characters and contain only letters and spaces',
  INVALID_YEAR: 'Please select a valid graduation year',
  INVALID_DEGREE: 'Degree must be at least 2 characters',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  TOO_SHORT: 'This field is too short',
  TOO_LONG: 'This field is too long',
  INVALID_FORMAT: 'Invalid format'
};

// Email validation with comprehensive regex
export const validateEmail = (email) => {
  if (!email) return false;
  
  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Additional checks
  if (email.length > 254) return false; // RFC limit
  if (email.includes('..')) return false; // No consecutive dots
  if (email.startsWith('.') || email.endsWith('.')) return false; // No leading/trailing dots
  
  return emailRegex.test(email);
};

// Enhanced password validation
export const validatePassword = (password) => {
  if (!password) return false;
  
  // Minimum 8 characters
  if (password.length < 8) return false;
  
  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // Must contain at least one number
  if (!/\d/.test(password)) return false;
  
  // Must contain at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  // No common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) return false;
  }
  
  return true;
};

// Password strength calculator
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: 'Enter a password' };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  else feedback.push('Add special characters');
  
  // Bonus points
  if (password.length >= 16) score += 1;
  if (/[^\w\s]/.test(password)) score += 1; // Non-alphanumeric
  
  const strength = {
    0: { level: 'Very Weak', color: 'red' },
    1: { level: 'Very Weak', color: 'red' },
    2: { level: 'Weak', color: 'orange' },
    3: { level: 'Fair', color: 'yellow' },
    4: { level: 'Good', color: 'lightgreen' },
    5: { level: 'Strong', color: 'green' },
    6: { level: 'Very Strong', color: 'darkgreen' },
    7: { level: 'Excellent', color: 'darkgreen' },
    8: { level: 'Excellent', color: 'darkgreen' }
  };
  
  return {
    score,
    ...strength[Math.min(score, 8)],
    feedback: feedback.length > 0 ? feedback : ['Great password!']
  };
};

// Name validation
export const validateName = (name) => {
  if (!name) return false;
  
  // Trim whitespace
  name = name.trim();
  
  // Minimum length
  if (name.length < 2) return false;
  
  // Maximum length
  if (name.length > 50) return false;
  
  // Only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) return false;
  
  // No consecutive spaces
  if (/\s{2,}/.test(name)) return false;
  
  // No leading/trailing spaces (after trim)
  if (name !== name.trim()) return false;
  
  return true;
};

// Phone number validation (international format)
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // International format: +1234567890 (7-15 digits after country code)
  const phoneRegex = /^\+?[1-9]\d{6,14}$/;
  
  return phoneRegex.test(cleaned);
};

// URL validation
export const validateURL = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Graduation year validation
export const validateGraduationYear = (year) => {
  if (!year) return false;
  
  const currentYear = new Date().getFullYear();
  const numYear = parseInt(year);
  
  // Must be a valid number
  if (isNaN(numYear)) return false;
  
  // Reasonable range: 1950 to current year + 10
  if (numYear < 1950 || numYear > currentYear + 10) return false;
  
  return true;
};

// Generic field validation
export const validateField = (value, rules = {}) => {
  const errors = [];
  
  // Required check
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(VALIDATION_ERRORS.REQUIRED);
    return errors; // Return early if required field is empty
  }
  
  // Skip other validations if field is empty and not required
  if (!value || value.toString().trim() === '') {
    return errors;
  }
  
  const stringValue = value.toString().trim();
  
  // Length validations
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters`);
  }
  
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters`);
  }
  
  // Type-specific validations
  if (rules.type) {
    switch (rules.type) {
      case 'email':
        if (!validateEmail(stringValue)) {
          errors.push(VALIDATION_ERRORS.INVALID_EMAIL);
        }
        break;
      case 'password':
        if (!validatePassword(stringValue)) {
          errors.push(VALIDATION_ERRORS.WEAK_PASSWORD);
        }
        break;
      case 'name':
        if (!validateName(stringValue)) {
          errors.push(VALIDATION_ERRORS.INVALID_NAME);
        }
        break;
      case 'phone':
        if (!validatePhone(stringValue)) {
          errors.push(VALIDATION_ERRORS.INVALID_PHONE);
        }
        break;
      case 'url':
        if (!validateURL(stringValue)) {
          errors.push(VALIDATION_ERRORS.INVALID_URL);
        }
        break;
      case 'year':
        if (!validateGraduationYear(stringValue)) {
          errors.push(VALIDATION_ERRORS.INVALID_YEAR);
        }
        break;
    }
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.patternMessage || VALIDATION_ERRORS.INVALID_FORMAT);
  }
  
  // Custom validation function
  if (rules.validate && typeof rules.validate === 'function') {
    const customResult = rules.validate(stringValue);
    if (customResult !== true) {
      errors.push(customResult || 'Invalid value');
    }
  }
  
  return errors;
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const fieldErrors = validateField(formData[fieldName], rules);
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  }
  
  return { isValid, errors };
};

// Real-time validation debouncer
export const createValidator = (validationFn, delay = 300) => {
  let timeoutId;
  
  return (value, callback) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const result = validationFn(value);
      callback(result);
    }, delay);
  };
};

// Sanitization helpers
export const sanitizeInput = (input, type = 'text') => {
  if (!input) return '';
  
  let sanitized = input.toString().trim();
  
  switch (type) {
    case 'email':
      sanitized = sanitized.toLowerCase();
      break;
    case 'name':
      // Capitalize first letter of each word
      sanitized = sanitized.replace(/\b\w/g, l => l.toUpperCase());
      break;
    case 'phone':
      // Remove all non-digit characters except +
      sanitized = sanitized.replace(/[^\d+]/g, '');
      break;
    case 'url':
      // Add protocol if missing
      if (sanitized && !sanitized.match(/^https?:\/\//)) {
        sanitized = 'https://' + sanitized;
      }
      break;
  }
  
  return sanitized;
};
