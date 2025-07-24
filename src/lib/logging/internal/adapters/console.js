import { LEVELS } from '$lib/logging/internal/unified-logger/constants.js';

/**
 * (Browser) console adapter that uses native DevTools styling
 */
export class ConsoleAdapter {
  /**
   * Create a new ConsoleAdapter
   *
   * @param {Object} [options] - Browser configuration options
   * @param {string} [options.level] - Minimum log level
   * @param {Object} [options.context]
   *   Additional context data to include with all logs
   */
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.context = options.context || {};
  }

  /**
   * Handle log events from Logger
   *
   * @param {Object} logEvent - Log event from Logger
   */
  handleLog(logEvent) {
    // eslint-disable-next-line no-unused-vars
    const { level, message, details, source, timestamp } = logEvent;

    // Filter by level
    if (LEVELS[level] < LEVELS[this.level]) {
      return;
    }

    // Use browser console styling
    const styles = this._getStyles(level);
    const prefix = `%c[${source}]`;

    // Merge context with details
    const logData = details
      ? { ...this.context, ...details }
      : Object.keys(this.context).length > 0
        ? this.context
        : undefined;

    if (logData) {
      console[this._getConsoleMethod(level)](prefix, styles, message, logData);
    } else {
      console[this._getConsoleMethod(level)](prefix, styles, message);
    }
  }

  /**
   * Get CSS styles for browser console
   *
   * @param {string} level - Log level
   * @returns {string} CSS styles
   * @private
   */
  _getStyles(level) {
    const baseStyle =
      'padding: 2px 4px; border-radius: 2px; font-weight: bold;';

    switch (level) {
      case 'debug':
        return `${baseStyle} background: #e3f2fd; color: #1976d2;`;
      case 'info':
        return `${baseStyle} background: #e8f5e8; color: #2e7d32;`;
      case 'warn':
        return `${baseStyle} background: #fff3e0; color: #f57c00;`;
      case 'error':
        return `${baseStyle} background: #ffebee; color: #d32f2f;`;
      case 'fatal':
        return `${baseStyle} background: #d32f2f; color: white;`;
      default:
        return baseStyle;
    }
  }

  /**
   * Get appropriate console method for log level
   *
   * @param {string} level - Log level
   * @returns {string} Console method name
   * @private
   */
  _getConsoleMethod(level) {
    switch (level) {
      case 'debug':
        return 'debug';
      case 'info':
        return 'info';
      case 'warn':
        return 'warn';
      case 'error':
      case 'fatal':
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Create a child logger with additional context
   *
   * @param {Object} context - Additional context data
   * @returns {ConsoleAdapter} New adapter instance with context
   */
  child(context) {
    return new ConsoleAdapter({
      level: this.level,
      context: { ...this.context, ...context }
    });
  }
}
