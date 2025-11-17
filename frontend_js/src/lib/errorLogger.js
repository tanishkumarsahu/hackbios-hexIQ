/**
 * Production-Ready Error Logging Service
 * Logs errors to console in development, can be extended to send to monitoring services
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class ErrorLogger {
  /**
   * Log authentication errors
   */
  static logAuthError(context, error, additionalData = {}) {
    const errorData = {
      context,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        name: error?.name,
        stack: isDevelopment ? error?.stack : undefined
      },
      ...additionalData
    };

    if (isDevelopment) {
      console.error(`[AUTH ERROR] ${context}:`, errorData);
    } else {
      // In production, log minimal info
      console.error(`[AUTH ERROR] ${context}`);
      
      // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
      // this.sendToMonitoring('auth_error', errorData);
    }

    return errorData;
  }

  /**
   * Log admin action errors
   */
  static logAdminError(action, error, additionalData = {}) {
    const errorData = {
      action,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        name: error?.name
      },
      ...additionalData
    };

    if (isDevelopment) {
      console.error(`[ADMIN ERROR] ${action}:`, errorData);
    } else {
      console.error(`[ADMIN ERROR] ${action}`);
      
      // TODO: Send to monitoring service
      // this.sendToMonitoring('admin_error', errorData);
    }

    return errorData;
  }

  /**
   * Log database errors
   */
  static logDatabaseError(operation, error, additionalData = {}) {
    const errorData = {
      operation,
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        code: error?.code,
        details: error?.details
      },
      ...additionalData
    };

    if (isDevelopment) {
      console.error(`[DB ERROR] ${operation}:`, errorData);
    } else {
      console.error(`[DB ERROR] ${operation}`);
      
      // TODO: Send to monitoring service
      // this.sendToMonitoring('database_error', errorData);
    }

    return errorData;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error) {
    // Map technical errors to user-friendly messages
    const errorMessages = {
      'PGRST116': 'Service temporarily unavailable. Please try again.',
      'PGRST301': 'Access denied. Please check your permissions.',
      '23505': 'This record already exists.',
      '23503': 'Cannot delete this record as it is being used.',
      'JWT expired': 'Your session has expired. Please sign in again.',
      'Invalid JWT': 'Your session is invalid. Please sign in again.',
      'Network request failed': 'Network error. Please check your connection.',
      'Failed to fetch': 'Network error. Please check your connection.'
    };

    // Check error message for known patterns
    const errorMsg = error?.message || '';
    const errorCode = error?.code || '';

    for (const [key, message] of Object.entries(errorMessages)) {
      if (errorMsg.includes(key) || errorCode === key) {
        return message;
      }
    }

    // Default message
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Send to monitoring service (placeholder for future implementation)
   */
  static sendToMonitoring(eventType, data) {
    // TODO: Implement integration with monitoring service
    // Examples:
    // - Sentry.captureException()
    // - LogRocket.captureException()
    // - Custom API endpoint
    
    // For now, just log that we would send this
    if (isDevelopment) {
      console.log('[MONITORING] Would send:', eventType, data);
    }
  }
}

export default ErrorLogger;
