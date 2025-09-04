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

/** @typedef {import('$lib/generic/typedef.js').ErrorDetails} ErrorDetails */

import { EventEmitter } from '$lib/generic/events.js';

import {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  LEVELS,
  LOG
} from '$lib/logging/levels.js';

import { DetailedError } from '$lib/generic/errors.js';
// import { LoggerError } from '$lib/logging/errors.js';

import { toArray } from '$lib/util/array.js';
import { exportNotNullish } from '$lib/util/object.js';

// import {
//   castErrorEventToDetailedError,
//   castPromiseRejectionToDetailedError
// } from './util.js';

import * as is from '$lib/util/is.js';
import { HttpError } from '$lib/network/errors.js';

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
   *
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
   *
   * @returns {boolean} True if the log was emitted
   */
  warn(message, details) {
    return this.#log(WARN, message, details);
  }

  /**
   * Log an error message
   *
   * @param {Error|ErrorEvent|PromiseRejectionEvent|string}
   *   errorOrMessage
   *
   * @param {Error|ErrorDetails} [errorOrDetails]
   *   Error object (when first param is string) or details object
   *
   * @param {ErrorDetails} [details]
   *   Additional context details (when using string + error pattern)
   *
   * @returns {boolean} True if the log was emitted
   */
  error(errorOrMessage, errorOrDetails, details) {
    let errorObject = null;

    let message;

    if( typeof errorOrMessage === 'string' )
    {
      message = errorOrMessage;
    }

    if (message) {

      // First param is a string (message)
      // => Second param might be the error (string + error pattern)

      if (this.#isErrorLike(errorOrDetails)) {
        let errorLike = errorOrDetails;
        errorObject = this.#toError(errorLike);
      }
    } else {

      // First param is not an (not empty) string
      // => First param should be the error

      if (this.#isErrorLike(errorOrMessage)) {
        let errorLike = errorOrMessage;
        errorObject = this.#toError(errorLike);
      }

      // Second parameter could be the details
      // Third parameter will be ignored (overwritten)
      details = errorOrDetails;
    }

    if( errorObject && details )
    {
      // Additional Details supplied
      // => Prepend additional DetailedError to chain
      errorObject = new DetailedError(message, details, errorObject );
    }

    if( message && errorObject )
    {
      // Log with message
      return this.#log(ERROR, message, errorObject);
    }
    else if (errorObject) {
      // Log without message
      return this.#log(ERROR, errorObject.message, errorObject);
    }
    else {
      // Missing error like object
      // => invalid parameters supplied to logger.error

      const detailedError = new DetailedError(
        'Missing error like object in Logger.error parameters',
        toArray(arguments)
      );

      return this.#log(ERROR, detailedError.message, detailedError);
    }
  }

  /**
   * Create a child logger with additional context
   *
   * @param {string} namespace
   *   Namespace of the context (needed for chaining contexts)
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
   * @param {import('$lib/logging/typedef.js').LogEventData} eventData
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
   * @param {import('$lib/logging/typedef.js').LogEvent} logEvent
   */
  #logEvent(logEvent) {
    // Emit as both specific level event and generic 'log' event
    this.emit(logEvent.level, logEvent);
    this.emit(LOG, logEvent);

    return true;
  }

  /**
   * Returns true is the supplied parameter is loggable as error
   *
   * @param {any} thing
   *
   * @returns {boolean}
   */
  #isErrorLike(thing) {
    return (
      thing instanceof Error ||
      is.ErrorEvent(thing) ||
      is.PromiseRejectionEvent(thing) ||
      is.SveltekitHttpError(thing)
    );
  }

  /**
   * Convert an Error like object (Error, ErrorEvent, PromiseRejectionEvent)
   * to a DetailedError
   *
   * @param {any} errorLike
   *
   * @returns {Error}
   */
  #toError( errorLike ) {
    if (is.ErrorEvent(errorLike)) {
      // errorLike is an ErrorEvent
      // => convert to DetailedError
      const errorEvent = /** @type {ErrorEvent} */ (errorLike);

      let errorEventDetails = exportNotNullish( errorEvent, [
        'message',
        'filename',
        'lineno',
        'colno'
      ]);

      errorEventDetails.type = 'ErrorEvent';

      let cause = errorEvent.error;

      return new DetailedError(
        errorEvent.message,
        errorEventDetails,
        cause
      );

    } else if (is.PromiseRejectionEvent(errorLike)) {
      // errorLike is a PromiseRejectionEvent
      // => convert to DetailedError
      const rejectionEvent = /** @type {PromiseRejectionEvent} */ (errorLike);

      const reason = rejectionEvent.reason;

      if (reason instanceof Error) {
        return reason;
      }
      else if ( is.object(reason) && reason?.message ) {
        // reason is  an object with message property
        return new DetailedError(reason?.message, reason);
      }
      else if ( typeof reason === "string" ) {
        // reason is a string
        return new DetailedError(reason);
      }
      else {
        // reason is not an Error or string
        return new DetailedError('Promise rejected', reason);
      }
    } else if (is.SveltekitHttpError(errorLike)) {
      // errorLike is a SvelteKit HttpError
      // => convert to lib's HttpError for consistent error handling
      const svelteKitError = errorLike;

      return new HttpError(
        svelteKitError.status,
        svelteKitError.body?.message || 'SvelteKit HttpError',
        exportNotNullish(svelteKitError),
        svelteKitError  // Set original SvelteKit error as cause
      );

    } else if (errorLike instanceof Error) {
      // errorLike is a plain Error
      // => return it
      return errorLike;
    }

    // errorLike cannot be converted to an Error
    // => return logging error

    return new DetailedError('Cannot convert to Error', errorLike);
  }
}
