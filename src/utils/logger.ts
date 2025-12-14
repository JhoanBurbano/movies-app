/**
 * Simple logger utility
 * In production, this could be replaced with a proper logging service
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // In development, use console
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data || '');
    }

    // In production, you could send to a logging service
    // Example: Sentry, LogRocket, etc.
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }
}

export const logger = new Logger();

