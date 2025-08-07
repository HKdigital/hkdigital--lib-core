import { dev } from '$app/environment';
import { LEVELS } from '$lib/logging/constants.js';

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
        const { error, errors, ...otherData } = logData;
        if (Object.keys(otherData).length > 0) {
          console.log('Additional data:', otherData);
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
        //logData.errors = this.#serializeErrorChain(details);
        logData.errors = this.#serializeErrorChain(details);
      } else {
        // Single error - keep as simple object
        const cleanedStack = this.#cleanStackTrace(details.stack);
        const relevantFrameIndex = this.#findRelevantFrameIndex(details, cleanedStack);
        logData.error = {
          name: details.name,
          message: details.message,
          stack: cleanedStack,
          errorType: this.#detectErrorType(details, cleanedStack),
          ...(relevantFrameIndex >= 0 && { relevantFrameIndex })
        };
      }
    } else if (details.error instanceof Error) {
      if (details.error.cause) {
        // Error has a cause chain - serialize to array
        logData.errors = this.#serializeErrorChain(details.error);
      } else {
        // Single error - keep as simple object
        const cleanedStack = this.#cleanStackTrace(details.error.stack);
        const relevantFrameIndex = this.#findRelevantFrameIndex(details.error, cleanedStack);
        logData.error = {
          name: details.error.name,
          message: details.error.message,
          stack: cleanedStack,
          errorType: this.#detectErrorType(details.error, cleanedStack),
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

    let current = err;
    // let isFirst = true;

    while (current) {
      const errorObj = {
        name: current.name || 'Unknown',
        message: current.message || 'No message'
      };

      // Add stack to every error for more information
      if (current.stack) {
        errorObj.stack = this.#cleanStackTrace(current.stack);

        // Find and mark the most relevant frame for highlighting
        const relevantFrameIndex = this.#findRelevantFrameIndex(current, errorObj.stack);
        if (relevantFrameIndex >= 0) {
          errorObj.relevantFrameIndex = relevantFrameIndex;
        }

        // Detect error type for display
        errorObj.errorType = this.#detectErrorType(current, errorObj.stack);
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
      // isFirst = false;
    }

    return chain;
  }

  /**
   * Find the most relevant frame index for highlighting
   */
  #findRelevantFrameIndex(error, cleanedStack) {
    if (error.name === 'ValiError') {
      // Look for expect_ function, user code is right after
      const expectIndex = cleanedStack.findIndex(frame => frame.includes('expect_'));
      if (expectIndex >= 0 && expectIndex + 1 < cleanedStack.length) {
        return expectIndex + 1;
      }
    }

    if (error.name === 'DetailedError') {
      // Look for rethrow, user code is right after
      const rethrowIndex = cleanedStack.findIndex(frame => frame.includes('rethrow@'));
      if (rethrowIndex >= 0 && rethrowIndex + 1 < cleanedStack.length) {
        return rethrowIndex + 1;
      }
    }

    if (error.name === 'PromiseError') {
      // Look for HkPromise methods, user code is right after
      const hkPromiseIndex = cleanedStack.findIndex(frame => 
        frame.includes('reject@') || 
        frame.includes('tryReject@') || 
        frame.includes('setTimeout@') || 
        frame.includes('cancel@') || 
        frame.includes('tryCancel@')
      );
      if (hkPromiseIndex >= 0 && hkPromiseIndex + 1 < cleanedStack.length) {
        return hkPromiseIndex + 1;
      }
    }

    if (error.name === 'HttpError') {
      // Find the last frame containing http-request.js, then highlight the next one
      let lastHttpIndex = -1;
      for (let i = 0; i < cleanedStack.length; i++) {
        if (cleanedStack[i].includes('network/http/http-request.js')) {
          lastHttpIndex = i;
        }
      }
      if (lastHttpIndex >= 0 && lastHttpIndex + 1 < cleanedStack.length) {
        return lastHttpIndex + 1;
      }
    }

    // Default to first frame
    return 0;
  }

  /**
   * Detect error type for display purposes with function name
   */
  #detectErrorType(error, cleanedStack) {
    const userFunctionName = this.#extractUserFunctionName(error, cleanedStack);
    const functionSuffix = userFunctionName ? ` in ${userFunctionName}` : '';

    // Check if it's a rethrow error
    if (error.name === 'DetailedError') {
      return `rethrow${functionSuffix}`;
    }

    // Check if it's a PromiseError (HkPromise)
    if (error.name === 'PromiseError') {
      // Determine the specific HkPromise method that caused the error
      const hkPromiseMethod = this.#getHkPromiseMethod(cleanedStack);
      if (hkPromiseMethod) {
        return `hkpromise.${hkPromiseMethod}${functionSuffix}`;
      }
      return `hkpromise${functionSuffix}`;
    }

    // Check if it's an HttpError
    if (error.name === 'HttpError') {
      // Determine the specific HTTP method that caused the error
      const httpMethod = this.#getHttpMethod(cleanedStack);
      if (httpMethod) {
        return `${httpMethod}${functionSuffix}`;
      }
      return `http${functionSuffix}`;
    }

    // Check if it's an expect error by looking at the first stack frame
    if (error.name === 'ValiError' && cleanedStack.length > 0) {
      const firstFrame = cleanedStack[0];
      if (firstFrame.startsWith('expect_')) {
        return `expect${functionSuffix}`;
      }
      if (firstFrame.startsWith('valibotParseWrapper@')) {
        return `validation${functionSuffix}`;
      }
    }

    // Default case
    return `error${functionSuffix}`;
  }

  /**
   * Get the specific HkPromise method that caused the error
   */
  #getHkPromiseMethod(cleanedStack) {
    const hkPromiseFrame = cleanedStack.find(frame => 
      frame.includes('reject@') || 
      frame.includes('tryReject@') || 
      frame.includes('setTimeout@') || 
      frame.includes('cancel@') || 
      frame.includes('tryCancel@')
    );
    
    if (!hkPromiseFrame) return null;
    
    if (hkPromiseFrame.includes('reject@')) return 'reject';
    if (hkPromiseFrame.includes('tryReject@')) return 'tryReject';
    if (hkPromiseFrame.includes('setTimeout@')) return 'setTimeout';
    if (hkPromiseFrame.includes('cancel@')) return 'cancel';
    if (hkPromiseFrame.includes('tryCancel@')) return 'tryCancel';
    
    return null;
  }

  /**
   * Get the specific HTTP method that caused the error
   */
  #getHttpMethod(cleanedStack) {
    const httpFrame = cleanedStack.find(frame => 
      frame.includes('network/http/http-request.js')
    );
    
    if (!httpFrame) return null;
    
    if (httpFrame.includes('httpGet@')) return 'httpGet';
    if (httpFrame.includes('httpPost@')) return 'httpPost';
    if (httpFrame.includes('httpPut@')) return 'httpPut';
    if (httpFrame.includes('httpDelete@')) return 'httpDelete';
    if (httpFrame.includes('httpPatch@')) return 'httpPatch';
    if (httpFrame.includes('httpOptions@')) return 'httpOptions';
    if (httpFrame.includes('httpRequest@')) return 'httpRequest';
    
    return null;
  }

  /**
   * Extract user function name from stack trace
   */
  #extractUserFunctionName(error, cleanedStack) {
    if (error.name === 'DetailedError' && cleanedStack.length > 1) {
      // For rethrow errors, look for the frame after rethrow
      const rethrowIndex = cleanedStack.findIndex(frame => frame.includes('rethrow@'));
      if (rethrowIndex >= 0 && rethrowIndex + 1 < cleanedStack.length) {
        return this.#parseFunctionName(cleanedStack[rethrowIndex + 1]);
      }
    }

    if (error.name === 'PromiseError' && cleanedStack.length > 1) {
      // For PromiseError, look for the frame after HkPromise methods
      const hkPromiseIndex = cleanedStack.findIndex(frame => 
        frame.includes('reject@') || 
        frame.includes('tryReject@') || 
        frame.includes('setTimeout@') || 
        frame.includes('cancel@') || 
        frame.includes('tryCancel@')
      );
      if (hkPromiseIndex >= 0 && hkPromiseIndex + 1 < cleanedStack.length) {
        return this.#parseFunctionName(cleanedStack[hkPromiseIndex + 1]);
      }
    }

    if (error.name === 'HttpError' && cleanedStack.length > 1) {
      // For HttpError, find the last frame containing http-request.js, then take the next one
      let lastHttpIndex = -1;
      for (let i = 0; i < cleanedStack.length; i++) {
        if (cleanedStack[i].includes('network/http/http-request.js')) {
          lastHttpIndex = i;
        }
      }
      if (lastHttpIndex >= 0 && lastHttpIndex + 1 < cleanedStack.length) {
        return this.#parseFunctionName(cleanedStack[lastHttpIndex + 1]);
      }
    }

    if (error.name === 'ValiError' && cleanedStack.length > 1) {
      // For validation errors, look for the frame after expect_ or validation wrapper
      const expectIndex = cleanedStack.findIndex(frame => frame.startsWith('expect_'));
      if (expectIndex >= 0 && expectIndex + 1 < cleanedStack.length) {
        return this.#parseFunctionName(cleanedStack[expectIndex + 1]);
      }
      
      const validationIndex = cleanedStack.findIndex(frame => frame.startsWith('valibotParseWrapper@'));
      if (validationIndex >= 0 && validationIndex + 1 < cleanedStack.length) {
        return this.#parseFunctionName(cleanedStack[validationIndex + 1]);
      }
    }

    // Find the first meaningful function name (skip anonymous functions and framework code)
    for (let i = 0; i < cleanedStack.length; i++) {
      const functionName = this.#parseFunctionName(cleanedStack[i]);
      if (functionName && this.#isMeaningfulFunctionName(functionName)) {
        return functionName;
      }
    }

    return null;
  }

  /**
   * Check if function name is meaningful (not anonymous or framework code)
   */
  #isMeaningfulFunctionName(functionName) {
    // Skip empty names, anonymous functions, and framework/internal functions
    if (!functionName || 
        functionName === '' || 
        functionName.includes('<') || 
        functionName.includes('/') ||
        functionName.startsWith('async ') ||
        functionName === 'async' ||
        functionName === 'Promise' ||
        functionName === 'new Promise' ||
        functionName.includes('internal') ||
        functionName.includes('node_modules')) {
      return false;
    }
    
    return true;
  }

  /**
   * Parse function name from stack frame
   */
  #parseFunctionName(frame) {
    // Frame format: "functionName@file:line:col"
    const match = frame.match(/^([^@]+)@/);
    return match ? match[1] : null;
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
