/**
 * Pino adapter for server-side logging
 */
import pino from 'pino';
import { dev } from '$app/environment';

import {
  detectErrorMeta,
  findRelevantFrameIndex,
  formatErrorDisplay,
  parseFunctionName
} from './formatting.js';

/**
 * Pino adapter that bridges Logger events to pino
 */
export class PinoAdapter {
  #projectRoot = null;

  /**
   * Create a new PinoAdapter
   *
   * @param {Object} [options] - Pino configuration options
   */
  constructor(options = {}) {
    // Determine project root once for stack trace cleaning
    this.#projectRoot = import.meta.env.VITE_PROJECT_ROOT || process.cwd();
    const baseOptions = {
      serializers: {

        //
        // Use 'errors' property to trigger Pino's error serializer
        // The serializer traverses the error.cause chain and outputs an array
        // of serialized error objects, which is why we use 'errors' (plural)
        // instead of Pino's standard 'err' property (which expects a single
        // error)
        //
        errors: (err) => {

          /** @type {import('./typedef').ErrorSummary[]} */
          const chain = [];
          let loggedAt = null;

          let current = err;
          let isFirst = true;

          while (current && current instanceof Error) {
            // Check if this is the first error and it's a LoggerError - extract logging context
            if (isFirst && current.name === 'LoggerError') {
              if (current.stack) {
                const cleanedStackString = this.#cleanStackTrace(current.stack);
                const cleanedStackArray = cleanedStackString
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(
                    (line) =>
                      line && line !== current.name + ': ' + current.message
                  );

                // For LoggerError, we know it's a logger.error call, so find the relevant frame
                const loggerErrorIndex = cleanedStackArray.findIndex(frame =>
                  (frame.includes('Logger.error') && frame.includes('logger/Logger.js')) ||
                  (frame.includes('error@') && frame.includes('logger/Logger.js'))
                );

                if (loggerErrorIndex >= 0 && loggerErrorIndex + 1 < cleanedStackArray.length) {
                  const relevantFrame = cleanedStackArray[loggerErrorIndex + 1];

                  // Extract function name from the relevant frame
                  // const functionName = parseFunctionName(relevantFrame);

                  // const errorType = functionName ? `logger.error in ${functionName}` : 'logger.error';
                  loggedAt = relevantFrame.slice(3); // remove "at "
                }
              }

              // Skip the LoggerError and move to the actual error
              current = current.cause;
              isFirst = false;
              continue;
            }
            /** @type {import('./typedef').ErrorSummary} */
            const serialized = {
              name: current.name,
              message: current.message
            };

            // Add error metadata for structured logging and terminal display
            if (current.stack) {
              // Convert cleaned stack string to array format expected by formatting functions
              const cleanedStackString = this.#cleanStackTrace(current.stack);
              const cleanedStackArray = cleanedStackString
                .split('\n')
                .map((line) => line.trim())
                .filter(
                  (line) =>
                    line && line !== current.name + ': ' + current.message
                );

              const errorMeta = detectErrorMeta(current, cleanedStackArray);
              const relevantFrameIndex = findRelevantFrameIndex(
                current,
                cleanedStackArray
              );

              serialized.meta = errorMeta;
              serialized.errorType = formatErrorDisplay(errorMeta);

              // Include stack frames for terminal display
              serialized.stackFrames = cleanedStackArray
                .slice(0, 9)
                .map((frame, index) => {
                  const marker = index === relevantFrameIndex ? '→' : ' ';

                  return `${marker} ${frame}`;
                });
            }

            // Include HttpError-specific properties
            const httpError = /** @type {import('$lib/network/errors.js').HttpError} */ (current);
            if (httpError.status !== undefined) {
              serialized.status = httpError.status;
            }
            if (httpError.details !== undefined) {
              serialized.details = httpError.details;
            }

            chain.push(serialized);
            current = current.cause;
            isFirst = false;
          }

          return loggedAt ? { chain, loggedAt } : chain;
        }
      }
    };

    // Add error handling for missing pino-pretty in dev
    if ( dev) {
      const devOptions = {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'hostname,pid'
          }
        }
      };

      try {
        this.pino = pino({ ...baseOptions, ...devOptions, ...options });
      } catch (error) {
        if (
          error.message.includes('Cannot find module') &&
          error.message.includes('pino-pretty')
        ) {
          const errorMessage = `
╭─────────────────────────────────────────────────────────────╮
│                     Missing Dependency                      │
├─────────────────────────────────────────────────────────────┤
│  'pino-pretty' is required for development logging          │
│  Install it with: pnpm add -D pino-pretty                   │
╰─────────────────────────────────────────────────────────────╯`;
          console.error(errorMessage);
          throw new Error('pino-pretty is required for development mode');
        }
        throw error;
      }
    } else {
      this.pino = pino({ ...baseOptions, ...options });
    }
  }

  /**
   * Clean stack trace by removing project root path and simplifying node_modules
   *
   * @param {string} stack - Original stack trace
   * @returns {string} Cleaned stack trace
   */
  #cleanStackTrace(stack) {
    if (!stack || !this.#projectRoot) {
      return stack;
    }

    let cleaned = stack;

    // Escape special regex characters in the project root path
    const escapedRoot = this.#projectRoot.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    // Replace project root path with relative path, handling file:// protocol
    // Match both regular paths and file:// URLs
    const rootRegex = new RegExp(
      `(\\s+at\\s+.*\\()(file://)?${escapedRoot}[\\/\\\\]`,
      'g'
    );
    cleaned = cleaned.replace(rootRegex, '$1');

    // Simplify pnpm paths: node_modules/.pnpm/package@version_deps/node_modules/package
    // becomes: node_modules/package
    const pnpmRegex =
      /node_modules\/\.pnpm\/([^@/]+)@[^/]+\/node_modules\/\1/g;
    cleaned = cleaned.replace(pnpmRegex, 'node_modules/$1');

    // Also handle cases where the package name might be different in the final path
    const pnpmRegex2 = /node_modules\/\.pnpm\/[^/]+\/node_modules\/([^/]+)/g;
    cleaned = cleaned.replace(pnpmRegex2, 'node_modules/$1');

    // Filter out Node.js internal modules and internal logger methods
    const lines = cleaned.split('\n');
    const filteredLines = lines.filter(line => 
      !line.includes('node:internal') &&
      !(line.includes('#toError') && line.includes('logger/Logger.js'))
    );
    cleaned = filteredLines.join('\n');

    return cleaned;
  }

  /**
   * Handle log events from Logger
   *
   * @param {Object} logEvent - Log event from Logger
   */
  handleLog(logEvent) {
    const { level, message, details, source, timestamp } = logEvent;

    const logData = {
      source,
      timestamp
    };

    // Check if details contains an error and promote it to error property for
    // pino serializer
    if (details) {
      if (details instanceof Error) {
        // details is directly an error
        logData.errors = details;
      } else if (details.error instanceof Error) {
        // details has an error property
        logData.errors = details.error;
        // Include other details except the error
        // eslint-disable-next-line no-unused-vars
        const { error, ...otherDetails } = details;
        if (Object.keys(otherDetails).length > 0) {
          logData.details = otherDetails;
        }
      } else {
        // No error found in details, include all details
        logData.details = details;
      }
    }

    // Check if we have loggedAt info from the serializer
    if (logData.errors && typeof logData.errors === 'object' && logData.errors.loggedAt) {
      logData.loggedAt = logData.errors.loggedAt;
      logData.errors = logData.errors.chain;
    }

    this.pino[level](logData, message);
  }

  /**
   * Create a child logger with additional context
   *
   * @param {Object} context - Additional context data
   * @returns {PinoAdapter} New adapter instance with context
   */
  child(context) {
    const childPino = this.pino.child(context);
    const adapter = new PinoAdapter();
    adapter.pino = childPino;
    return adapter;
  }
}
