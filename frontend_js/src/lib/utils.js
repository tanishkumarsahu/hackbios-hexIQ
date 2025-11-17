import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password) return false;
  
  // Basic length requirement (minimum 6 characters)
  if (password.length < 6) return false;
  
  return true;
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: [] };
  
  let score = 0;
  const feedback = [];
  
  // Length check
  if (password.length >= 6) score += 1;
  else feedback.push('Use at least 6 characters');
  
  if (password.length >= 8) score += 1;
  else if (password.length >= 6) feedback.push('Consider using 8+ characters for better security');
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include symbols (!@#$%^&*)');
  
  return { score, feedback };
};

export const getPasswordStrengthLabel = (score) => {
  if (score <= 2) return { label: 'Weak', color: 'red' };
  if (score <= 4) return { label: 'Fair', color: 'yellow' };
  if (score <= 5) return { label: 'Good', color: 'blue' };
  return { label: 'Strong', color: 'green' };
};

// Format helpers
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

// Storage helpers
export const getStorageItem = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

export const setStorageItem = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

export const removeStorageItem = (key) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};
