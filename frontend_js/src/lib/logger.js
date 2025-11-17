/**
 * Production-ready logger utility
 * Logs to console in development, can be extended for production logging services
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`;

    if (isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.log(prefix, message, data || '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data || '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data || '');
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data || '');
          break;
        default:
          console.log(prefix, message, data || '');
      }
    } else {
      // In production, you can send to logging service (e.g., Sentry, LogRocket)
      if (level === LogLevel.ERROR) {
        // Send to error tracking service
        console.error(prefix, message, data);
      }
    }
  }

  debug(message, data) {
    this._log(LogLevel.DEBUG, message, data);
  }

  info(message, data) {
    this._log(LogLevel.INFO, message, data);
  }

  warn(message, data) {
    this._log(LogLevel.WARN, message, data);
  }

  error(message, data) {
    this._log(LogLevel.ERROR, message, data);
  }

  // Specialized auth logging
  authEvent(event, details) {
    this.info(`🔐 Auth Event: ${event}`, details);
  }

  logoutEvent(step, details) {
    this.info(`🚪 Logout: ${step}`, details);
  }
}

// Create singleton instances for different contexts
export const authLogger = new Logger('Auth');
export const appLogger = new Logger('App');
export const apiLogger = new Logger('API');

export default Logger;
