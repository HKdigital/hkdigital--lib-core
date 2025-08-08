import { dev } from '$app/environment';
import { LEVELS } from '$lib/logging/constants.js';
import {
  findRelevantFrameIndex,
  detectErrorMeta,
  formatErrorDisplay,
  isMeaningfulFunctionName,
  parseFunctionName
} from './formatting.js';

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
    const styles = this.#getStyles(level);
    const prefix = `%c[${source}]`;

    // Process details for better error formatting
    const logData = this.#processLogData(details);

    if (logData) {
      const consoleMethod = console[this.#getConsoleMethod(level)];

      if (dev && (logData.error || logData.errors)) {
        // In development mode, expand errors automatically - use black for main message
        console.log(
          `%c${message} %c[${source}]`,
          'color: #d32f2f; font-weight: bold;',
          'color: #000; font-weight: normal;'
        );
        if (logData.errors) {
          logData.errors.forEach((error, index) => {
            const appendix = error.errorType ? error.errorType : error.name;

            console.group(
              `%c${index + 1}. ${error.message} %c(${appendix})`,
              'color: #d32f2f; font-weight: normal;',
              'color: #000; font-weight: normal;'
            );
            if (error.stack) {
              console.groupCollapsed(`Stack (${error.stack.length} frames)`);
              error.stack.forEach((frame, index) => {
                // Highlight the relevant frame in bold
                const isRelevant = error.relevantFrameIndex === index;
                console.log(
                  `%c${index}: %c${frame}`,
                  'color: #666;',
                  isRelevant ? 'color: #000; font-weight: bold;' : 'color: #000;'
                );
              });
              console.groupEnd();
            }
            if (error.details) {
              console.log('Details:', error.details);
            }
            if (error.status) {
              console.log('Status:', error.status);
            }
            console.groupEnd();
          });
        } else if (logData.error) {
          const appendix = logData.error.errorType ? logData.error.errorType : logData.error.name;

          console.group(
            `%c${logData.error.name}: ${logData.error.message} (${appendix})`,
            'color: #d32f2f; font-weight: bold;'
          );
          if (logData.error.stack) {
            console.groupCollapsed(
              `Stack (${logData.error.stack.length} frames)`
            );
            logData.error.stack.forEach((frame, index) => {
              // Highlight the relevant frame in bold
              const isRelevant = logData.error.relevantFrameIndex === index;
              console.log(
                `%c${index}: %c${frame}`,
                'color: #666;',
                isRelevant ? 'color: #000; font-weight: bold;' : 'color: #000;'
              );
            });
            console.groupEnd();
          }
          if (logData.error.details) {
            console.log('Details:', logData.error.details);
          }
          if (logData.error.status) {
            console.log('Status:', logData.error.status);
          }
          console.groupEnd();
        }

        // Log any other properties
        // eslint-disable-next-line no-unused-vars
        const { error, errors, loggedAt } = logData;
        if (loggedAt) {
          console.log('Logged at:', loggedAt);
        }
      } else {
        // Production mode or non-error data - use compact format
        consoleMethod(prefix, styles, message, logData);
      }
    } else {
      console[this.#getConsoleMethod(level)](prefix, styles, message);
    }
  }

  /**
   * Get CSS styles for browser console
   *
   * @param {string} level - Log level
   * @returns {string} CSS styles
   */
  #getStyles(level) {
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
   */
  #getConsoleMethod(level) {
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
   * Process log data for better formatting, especially errors
   *
   * @param {*} details - Log details
   * @returns {Object|undefined} Processed log data
   */
  #processLogData(details) {
    // Merge context first
    let logData =
      Object.keys(this.context).length > 0 ? { ...this.context } : {};

    if (!details) {
      return Object.keys(logData).length > 0 ? logData : undefined;
    }

    // Check if details contains an error with causes - serialize to array
    if (details instanceof Error) {
      if (details.cause) {
        // Error has a cause chain - serialize to array
        const serialized = this.#serializeErrorChain(details);
        if (serialized.loggedAt) {
          logData.loggedAt = serialized.loggedAt;
          logData.errors = serialized.chain;
        } else {
          logData.errors = serialized;
        }
      } else {
        // Single error - keep as simple object
        const cleanedStack = this.#cleanStackTrace(details.stack);
        const relevantFrameIndex = findRelevantFrameIndex(details, cleanedStack);
        const errorMeta = detectErrorMeta(details, cleanedStack);
        logData.error = {
          name: details.name,
          message: details.message,
          stack: cleanedStack,
          errorType: formatErrorDisplay(errorMeta),
          ...(relevantFrameIndex >= 0 && { relevantFrameIndex })
        };
      }
    } else if (details.error instanceof Error) {
      if (details.error.cause) {
        // Error has a cause chain - serialize to array
        const serialized = this.#serializeErrorChain(details.error);
        if (serialized.loggedAt) {
          logData.loggedAt = serialized.loggedAt;
          logData.errors = serialized.chain;
        } else {
          logData.errors = serialized;
        }
      } else {
        // Single error - keep as simple object
        const cleanedStack = this.#cleanStackTrace(details.error.stack);
        const relevantFrameIndex = findRelevantFrameIndex(details.error, cleanedStack);
        const errorMeta = detectErrorMeta(details.error, cleanedStack);
        logData.error = {
          name: details.error.name,
          message: details.error.message,
          stack: cleanedStack,
          errorType: formatErrorDisplay(errorMeta),
          ...(relevantFrameIndex >= 0 && { relevantFrameIndex })
        };
      }
      // Include other details except the error
      // eslint-disable-next-line no-unused-vars
      const { error, ...otherDetails } = details;
      if (Object.keys(otherDetails).length > 0) {
        Object.assign(logData, otherDetails);
      }
    } else {
      Object.assign(logData, details);
    }

    return Object.keys(logData).length > 0 ? logData : undefined;
  }

  /**
   * Serialize error chain into a simple array
   *
   * @param {Error|import('$lib/errors/generic.js').DetailedError} err
   * @returns {Array} Array of error objects
   */
  #serializeErrorChain(err) {
    const chain = [];
    let loggedAt = null;

    let current = err;
    let isFirst = true;

    while (current) {
      // Check if this is the first error and it's a LoggerError - extract logging context
      if (isFirst && current.name === 'LoggerError') {
        if (current.stack) {
          const cleanedStack = this.#cleanStackTrace(current.stack);

          // For LoggerError, we know it's a logger.error call, so find the relevant frame
          const loggerErrorIndex = cleanedStack.findIndex(frame =>
            (frame.includes('Logger.error') && frame.includes('logger/Logger.js')) ||
            (frame.includes('error@') && frame.includes('logger/Logger.js'))
          );

          if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStack.length) {
            const relevantFrame = cleanedStack[loggerErrorIndex + 1];
            // Remove the "at " prefix for cleaner output
            loggedAt = relevantFrame.replace(/^\d+→?\s*/, '').replace(/^at\s+/, '');
          }
        }

        // Skip the LoggerError and move to the actual error
        current = current.cause;
        isFirst = false;
        continue;
      }
      const errorObj = {
        name: current.name || 'Unknown',
        message: current.message || 'No message'
      };

      // Add stack to every error for more information
      if (current.stack) {
        errorObj.stack = this.#cleanStackTrace(current.stack);

        // Find and mark the most relevant frame for highlighting
        const relevantFrameIndex = findRelevantFrameIndex(current, errorObj.stack);
        if (relevantFrameIndex >= 0) {
          errorObj.relevantFrameIndex = relevantFrameIndex;
        }

        // Detect error metadata for display
        const errorMeta = detectErrorMeta(current, errorObj.stack);
        errorObj.errorType = formatErrorDisplay(errorMeta);
      }

      // Include additional properties like details, status
      if ('details' in current) {
        errorObj.details = current.details;
      }
      if ('status' in current) {
        errorObj.status = current.status;
      }

      chain.push(errorObj);
      current = /** @type {Error} */ (current.cause);
      isFirst = false;
    }

    return loggedAt ? { chain, loggedAt } : chain;
  }


  /**
   * Clean stack trace for browser display and convert to array
   *
   * @param {string} stack - Original stack trace
   * @returns {Array<string>} Cleaned stack trace as array of relevant frames
   */
  #cleanStackTrace(stack) {
    if (!stack) {
      return [];
    }

    const lines = stack.split('\n');
    const relevantFrames = [];

    // Debug: log the original stack to see what we're working with
    // console.debug('Original stack lines:', lines);

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        continue;
      }

      // Detect stack frame lines:
      // Firefox/Safari: "functionName@url:line:col"
      // Chrome: "at functionName (url:line:col)" or "at url:line:col"
      const isFirefoxFormat = trimmed.includes('@');
      const isChromeFormat = trimmed.startsWith('at ');

      if (!isFirefoxFormat && !isChromeFormat) {
        continue; // Skip error message line
      }

      let cleaned = trimmed;

      // Convert Chrome format to Firefox format for consistency
      if (isChromeFormat) {
        // "at functionName (url:line:col)" -> "functionName@url:line:col"
        cleaned = cleaned.replace(/^at\s+(.+?)\s+\((.+)\)$/, '$1@$2');
        // "at url:line:col" -> "url:line:col" (anonymous function)
        cleaned = cleaned.replace(/^at\s+([^(]+)$/, '$1');
      }

      // Remove localhost URLs and make them relative
      cleaned = cleaned.replace(/http:\/\/localhost:\d+\//g, '');

      // Simplify vite dev dependencies
      cleaned = cleaned.replace(
        /node_modules\/\.vite\/deps\/[^?]+\?v=[a-f0-9]+/g,
        'node_modules/vite-deps'
      );

      // Clean up query parameters on source files
      cleaned = cleaned.replace(/\?t=\d+/g, '');

      // Skip vite-deps (Svelte framework internals) but keep other node_modules
      if (cleaned.includes('node_modules/vite-deps')) {
        continue;
      }

      // Skip .svelte-kit generated files (except first few)
      if (
        cleaned.includes('.svelte-kit/generated') &&
        relevantFrames.length > 3
      ) {
        continue;
      }

      relevantFrames.push(cleaned);

      // Limit to first 15 relevant frames to see more
      if (relevantFrames.length >= 15) {
        break;
      }
    }

    // console.debug('Cleaned stack frames:', relevantFrames);
    return relevantFrames;
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
