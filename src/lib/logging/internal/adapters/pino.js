/**
 * Pino adapter for server-side logging
 */

import pino from 'pino';
import { dev } from '$app/environment';

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
        err: (err) => {
          const chain = [];
          let current = err;
          let isFirst = true;

          while (current) {
            /** @type {import('./typedef').ErrorSummary} */
            const serialized = {
              name: current.name,
              message: current.message,
              ...(isFirst && {
                stack: this.#cleanStackTrace(current.stack)
              })
            };

            // Include HttpError-specific properties
            if (current.status !== undefined) {
              serialized.status = current.status;
            }
            if (current.details !== undefined) {
              serialized.details = current.details;
            }

            chain.push(serialized);
            current = current.cause;
            isFirst = false;
          }

          return { errorChain: chain };
        }
      }
    };

    // Add error handling for missing pino-pretty in dev
    if (dev) {
      const devOptions = {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
      };

      try {
        this.pino = pino({ ...baseOptions, ...devOptions, ...options });
      } catch (error) {
        if (error.message.includes('pino-pretty')) {
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
    const escapedRoot = this.#projectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace project root path with relative path, handling file:// protocol
    // Match both regular paths and file:// URLs
    const rootRegex = new RegExp(`(\\s+at\\s+.*\\()(file://)?${escapedRoot}[\\/\\\\]`, 'g');
    cleaned = cleaned.replace(rootRegex, '$1');

    // Simplify pnpm paths: node_modules/.pnpm/package@version_deps/node_modules/package
    // becomes: node_modules/package
    const pnpmRegex = /node_modules\/\.pnpm\/([^@\/]+)@[^\/]+\/node_modules\/\1/g;
    cleaned = cleaned.replace(pnpmRegex, 'node_modules/$1');

    // Also handle cases where the package name might be different in the final path
    const pnpmRegex2 = /node_modules\/\.pnpm\/[^\/]+\/node_modules\/([^\/]+)/g;
    cleaned = cleaned.replace(pnpmRegex2, 'node_modules/$1');

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

    // Check if details contains an error and promote it to err property for pino serializer
    if (details) {
      if (details instanceof Error) {
        // details is directly an error
        logData.err = details;
      } else if (details.error instanceof Error) {
        // details has an error property
        logData.err = details.error;
        // Include other details except the error
        const { error, ...otherDetails } = details;
        if (Object.keys(otherDetails).length > 0) {
          logData.details = otherDetails;
        }
      } else {
        // No error found in details, include all details
        logData.details = details;
      }
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
