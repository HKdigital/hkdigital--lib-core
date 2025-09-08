/**
 * Pino adapter for server-side logging
 */
import pino from 'pino';
import { dev } from '$app/environment';

import { HkPromise } from '$lib/generic/promises.js';
import { ERROR } from '$lib/logging/levels.js';

import {
  detectErrorMeta,
  findRelevantFrameIndex,
  formatErrorDisplay
} from './formatting.js';

/**
 * Pino adapter that bridges Logger events to pino
 */
export class PinoAdapter {
  #projectRoot = null;

  /** @type {import('pino').Logger|Object|null} */
  #pino = null;

  #options = null;
  #messageQueue = [];
  #isInitializing = false;
  #isTransportReady = false;
  #retryCount = 0;
  #maxRetries = 3;
  #retryDelay = 1000;
  #readyPromise = null;

  /**
   * Create a new PinoAdapter
   *
   * @param {Object} [options] - Pino configuration options
   */
  constructor(options = {}) {
    this.#projectRoot = import.meta.env.VITE_PROJECT_ROOT || process.cwd();
    this.#options = options;
    this.#readyPromise = new HkPromise();
  }

  /**
   * Get base configuration options for pino
   *
   * @returns {Object} Base pino configuration
   */
  #getBaseOptions() {
    return {
      serializers: {
        errors: (err) => {
          /** @type {import('./typedef').ErrorSummary[]} */
          const chain = [];
          let loggedAt = null;

          let current = err;
          let isFirst = true;

          while (current && current instanceof Error) {
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

                const loggerErrorIndex = cleanedStackArray.findIndex(
                  (frame) =>
                    (frame.includes('Logger.error') &&
                      frame.includes('logger/Logger.js')) ||
                    (frame.includes('error@') &&
                      frame.includes('logger/Logger.js'))
                );

                if (
                  loggerErrorIndex >= 0 &&
                  loggerErrorIndex + 1 < cleanedStackArray.length
                ) {
                  const relevantFrame = cleanedStackArray[loggerErrorIndex + 1];
                  loggedAt = relevantFrame.slice(3);
                }
              }

              current = current.cause;
              isFirst = false;
              continue;
            }
            /** @type {import('./typedef').ErrorSummary} */
            const serialized = {
              name: current.name,
              message: current.message
            };

            if (current.stack) {
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

              serialized.stackFrames = cleanedStackArray
                .slice(0, 9)
                .map((frame, index) => {
                  const marker = index === relevantFrameIndex ? '→' : ' ';
                  return `${marker} ${frame}`;
                });
            }

            const httpError =
              /** @type {import('$lib/network/errors.js').HttpError} */ (
                current
              );
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
  }

  /**
   * Initialize pino instance with retry logic for transport setup
   */
  async #initializePino() {
    if (this.#isInitializing || this.#pino) {
      return;
    }

    this.#isInitializing = true;

    const baseOptions = this.#getBaseOptions();

    while (this.#retryCount <= this.#maxRetries) {
      try {
        if (dev) {
          // Use intermediate transport to avoid worker thread issues
          const { default: createPrettyTransport } = await import('../transports/pretty-transport.js');
          const prettyTransport = await createPrettyTransport({
            colorize: true,
            ignore: 'hostname,pid'
          });
          
          const devOptions = {
            level: 'debug'
          };

          this.#pino = pino({ ...baseOptions, ...devOptions, ...this.#options }, prettyTransport);
        } else {
          this.#pino = pino({ ...baseOptions, ...this.#options });
        }

        this.#isTransportReady = true;
        this.#isInitializing = false;
        this.#flushMessageQueue();
        this.#readyPromise.tryResolve();
        return;

      } catch (error) {
        this.#retryCount++;

        if (error.message.includes('Cannot find module') &&
            error.message.includes('pino-pretty')) {
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

        if (this.#retryCount > this.#maxRetries) {
          console.error('Failed to initialize pino transport after retries:', error.message);
          this.#fallbackToConsole();
          this.#readyPromise.tryResolve();
          return;
        }

        await new Promise(resolve => setTimeout(resolve, this.#retryDelay * this.#retryCount));
      }
    }
  }

  /**
   * Flush queued messages to pino transport
   */
  #flushMessageQueue() {
    if (!this.#pino || !this.#isTransportReady) {
      return;
    }

    while (this.#messageQueue.length > 0) {
      const queuedLog = this.#messageQueue.shift();
      try {
        this.#pino[queuedLog.level](queuedLog.data, queuedLog.message);
      } catch (error) {
        console.error('Failed to flush queued log message:', error.message);
        this.#isTransportReady = false;
        this.#messageQueue.unshift(queuedLog);
        break;
      }
    }
  }

  /**
   * Fallback to console logging when transport fails
   */
  #fallbackToConsole() {
    this.#isTransportReady = true;
    this.#isInitializing = false;

    while (this.#messageQueue.length > 0) {
      const queuedLog = this.#messageQueue.shift();
      console[queuedLog.level === ERROR ? 'error' : 'log'](
        `[${queuedLog.level.toUpperCase()}] ${queuedLog.message}`,
        queuedLog.data
      );
    }

    this.#pino = {
      debug: (data, msg) => console.log(`[DEBUG] ${msg}`, data),
      info: (data, msg) => console.log(`[INFO] ${msg}`, data),
      warn: (data, msg) => console.warn(`[WARN] ${msg}`, data),
      error: (data, msg) => console.error(`[ERROR] ${msg}`, data),
      // eslint-disable-next-line no-unused-vars
      child: (context) => this
    };
  }

  /**
   * Promise that resolves when transport is ready
   *
   * @returns {Promise<void>} Promise that resolves when ready
   */
  ready() {
    if (this.#isTransportReady) {
      return Promise.resolve();
    }

    if (!this.#isInitializing) {
      this.#initializePino();
    }

    return this.#readyPromise;
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
    const pnpmRegex = /node_modules\/\.pnpm\/([^@/]+)@[^/]+\/node_modules\/\1/g;
    cleaned = cleaned.replace(pnpmRegex, 'node_modules/$1');

    // Also handle cases where the package name might be different in the final path
    const pnpmRegex2 = /node_modules\/\.pnpm\/[^/]+\/node_modules\/([^/]+)/g;
    cleaned = cleaned.replace(pnpmRegex2, 'node_modules/$1');

    // Filter out Node.js internal modules and internal logger methods
    const lines = cleaned.split('\n');
    const filteredLines = lines.filter(
      (line) =>
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
  async handleLog(logEvent) {
    const { level, message, details, source, timestamp } = logEvent;

    const logData = {
      source,
      timestamp
    };

    if (details) {
      if (details instanceof Error) {
        logData.errors = details;
      } else if (details.error instanceof Error) {
        logData.errors = details.error;
        // eslint-disable-next-line no-unused-vars
        const { error, ...otherDetails } = details;
        if (Object.keys(otherDetails).length > 0) {
          logData.details = otherDetails;
        }
      } else {
        logData.details = details;
      }
    }

    if (
      logData.errors &&
      typeof logData.errors === 'object' &&
      logData.errors.loggedAt
    ) {
      logData.loggedAt = logData.errors.loggedAt;
      logData.errors = logData.errors.chain;
    }

    // Queue message if transport not ready
    if (!this.#isTransportReady) {
      this.#messageQueue.push({ level, data: logData, message });

      // Limit queue size to prevent memory issues
      if (this.#messageQueue.length > 1000) {
        this.#messageQueue.shift();
      }

      // Initialize transport if not already doing so
      if (!this.#isInitializing) {
        this.#initializePino();
      }
      return;
    }

    // Try to log directly, queue on failure
    try {
      this.#pino[level](logData, message);
    } catch (error) {
      console.error('Transport failed, queuing message:', error.message);
      this.#isTransportReady = false;
      this.#messageQueue.push({ level, data: logData, message });

      // Retry transport initialization
      this.#retryCount = 0;
      setTimeout(() => this.#initializePino(), this.#retryDelay);
    }
  }

  /**
   * Create a child logger with additional context
   *
   * @param {Object} context - Additional context data
   * @returns {PinoAdapter} New adapter instance with context
   */
  child(context) {
    if (!this.#pino) {
      // Return new adapter that inherits parent options with context
      return new PinoAdapter({ ...this.#options, ...context });
    }

    const childPino = this.#pino.child(context);
    const adapter = new PinoAdapter();
    adapter.#pino = childPino;
    adapter.#isTransportReady = this.#isTransportReady;
    adapter.#readyPromise = new HkPromise();
    adapter.#readyPromise.tryResolve();
    return adapter;
  }
}
