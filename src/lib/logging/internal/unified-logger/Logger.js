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
 * import { Logger, LOG, INFO, DEBUG } from '@hkdigital/lib-core/logger/index.js';
 *
 * const logger = new Logger('myService', INFO);
 *
 * // Log at different levels
 * logger.debug('Detailed information', { value: 42 }); // Filtered out at INFO
 * logger.info('Operation completed', { items: 27 });   // Will be logged
 * logger.warn('Unusual condition detected');           // Will be logged
 *
 * // Listen to log events
 * logger.on(LOG, (logEvent) => {
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

import { EventEmitter } from '$lib/classes/event-emitter';

import {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  LEVELS,
  LOG
} from './constants.js';

/**
 * Logger class for consistent logging
 * @extends EventEmitter
 */
export default class Logger extends EventEmitter {
  #defaultContext;
  #hasContext;

  /**
   * Create a new Logger instance
   *
   * @param {string} name - Name of the service/component for this logger
   * @param {string} [defaultLevel=INFO] - Initial log level threshold
   * @param {Object} [context={}] - Default context data for all logs
   */
  constructor(name, defaultLevel = INFO, context = {}) {
    super();
    this.name = name;
    this.level = defaultLevel;

    this.#defaultContext = structuredClone(context);
    this.#hasContext = Object.keys(this.#defaultContext).length > 0;
  }

  /**
   * Set the minimum log level threshold
   *
   * @param {string} level - New log level (DEBUG, INFO, WARN, ERROR or NONE)
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
   * Log a debug message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  debug(message, details) {
    return this.#log(DEBUG, message, details);
  }

  /**
   * Log an info message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  info(message, details) {
    return this.#log(INFO, message, details);
  }

  /**
   * Log a warning message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  warn(message, details) {
    return this.#log(WARN, message, details);
  }

  /**
   * Log an error message
   *
   * @param {string} message - Log message
   * @param {*} [details] - Additional details
   * @returns {boolean} True if the log was emitted
   */
  error(message, details) {
    return this.#log(ERROR, message, details);
  }

  /**
   * Create a child logger with additional context
   *
   * @param {string} namespace
   *   Namespace of the context (needed for chaining contexts)
   *
   * @param {Object} additionalContext - Additional context data
   *
   * @returns {Logger} New logger instance with merged context
   */
  context(namespace, additionalContext) {
    if (typeof namespace !== 'string') {
      throw new Error('Invalid namespace');
    }

    const mergedContext = {
      ...this.#defaultContext,
      [namespace]: additionalContext
    };

    return new Logger(this.name, this.level, mergedContext);
  }

  /**
   * Log an LogEvent emitted by an event emitter
   *
   * E.g. an event that was created by another Logger instance and should be
   * forwarded to this logger.
   *
   * @param {string} eventName
   * @param {import('./typedef.js').LogEventData} eventData
   */
  logFromEvent(eventName, eventData) {
    const level = eventData.level;

    // Check if this log level should be filtered
    if (LEVELS[level] < LEVELS[this.level]) {
      return false; // Below threshold, don't emit
    }

    this.#logEvent({ ...eventData, eventName });
  }

  /**
   * Internal logging method
   *
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {*} [details] - Additional details to include in the log
   * @returns {boolean} True if the log was emitted, false if filtered
   */
  #log(level, message, details) {
    // Check if this log level should be filtered
    if (LEVELS[level] < LEVELS[this.level]) {
      return false; // Below threshold, don't emit
    }

    const timestamp = new Date();

    const logEvent = {
      timestamp,
      source: this.name,
      level,
      message,
      context: this.#hasContext ? this.#defaultContext : null,
      details: details ?? null
    };

    // Emit as both specific level event and generic LOG event
    this.emit(level, logEvent);
    this.emit(LOG, logEvent);

    return true;
  }

  /**
   * Internal event loggin method
   *
   * @param {import('./typedef.js').LogEvent} logEvent
   */
  #logEvent(logEvent) {
    // Emit as both specific level event and generic 'log' event
    this.emit(logEvent.level, logEvent);
    this.emit(LOG, logEvent);

    return true;
  }
}
