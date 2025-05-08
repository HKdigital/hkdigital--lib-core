/**
 * @fileoverview Logger implementation based on EventEmitter e.g.
 * for service logging.
 *
 * This Logger provides consistent log level filtering and event-based
 * distribution of log messages. It integrates with the service architecture
 * to provide controlled, consistent logging across all services.
 *
 * @example
 * // Basic usage
 * import { Logger, INFO, DEBUG } from './Logger.js';
 *
 * const logger = new Logger('myService', INFO);
 *
 * // Log at different levels
 * logger.debug('Detailed information', { value: 42 }); // Filtered out at INFO
 * logger.info('Operation completed', { items: 27 });   // Will be logged
 * logger.warn('Unusual condition detected');           // Will be logged
 *
 * // Listen to log events
 * logger.on('log', (logEvent) => {
 *   // Process all log events
 *   saveToLogFile(logEvent);
 * });
 *
 * logger.on(ERROR, (logEvent) => {
 *   // Process only error events
 *   sendAlertEmail(logEvent);
 * });
 *
 * // Change log level at runtime
 * logger.setLevel(DEBUG); // Now debug messages will also be logged
 */

import { EventEmitter } from '$lib/classes/events';

import { DEBUG, INFO, WARN, ERROR, FATAL, NONE, LEVELS } from './constants.js';

/**
 * Logger class for consistent logging across services
 * @extends EventEmitter
 */
export default class Logger extends EventEmitter {
  /**
   * Create a new Logger instance
   *
   * @param {string} name - Name of the service/component for this logger
   * @param {string} [defaultLevel=INFO] - Initial log level threshold
   */
  constructor(name, defaultLevel = INFO) {
    super();
    this.name = name;
    this.level = defaultLevel;
  }

  /**
   * Set the minimum log level threshold
   *
   * @param {string} level - New log level (DEBUG, INFO, WARN, ERROR, FATAL,
   *                         or NONE)
   * @returns {boolean} True if level was valid and set, false otherwise
   */
  setLevel(level) {
    if (LEVELS[level] !== undefined) {
      this.level = level;
      return true;
    }

    console.warn(`Invalid log level: ${level}`);
    return false;
  }

  /**
   * Internal logging method
   *
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} [details] - Additional details to include in the log
   * @returns {boolean} True if the log was emitted, false if filtered
   * @private
   */
  _log(level, message, details) {
    // Check if this log level should be filtered
    if (LEVELS[level] < LEVELS[this.level]) {
      return false; // Below threshold, don't emit
    }

    const timestamp = new Date();
    const logEvent = {
      timestamp,
      service: this.name,
      level,
      message,
      details
    };

    // Emit as both specific level event and generic 'log' event
    this.emit(level, logEvent);
    this.emit('log', logEvent);

    return true;
  }

  /**
   * Log a debug message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  debug(message, details) {
    return this._log(DEBUG, message, details);
  }

  /**
   * Log an info message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  info(message, details) {
    return this._log(INFO, message, details);
  }

  /**
   * Log a warning message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  warn(message, details) {
    return this._log(WARN, message, details);
  }

  /**
   * Log an error message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  error(message, details) {
    return this._log(ERROR, message, details);
  }

  /**
   * Log a fatal error message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  fatal(message, details) {
    return this._log(FATAL, message, details);
  }
}
