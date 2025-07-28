/**
 * Pino adapter for server-side logging
 */

import pino from 'pino';
import { dev } from '$app/environment';

/**
 * Pino adapter that bridges Logger events to pino
 */
export class PinoAdapter {
  /**
   * Create a new PinoAdapter
   *
   * @param {Object} [options] - Pino configuration options
   */
  constructor(options = {}) {
    const baseOptions = {
      serializers: {
        err: (err) => {
          const chain = [];
          let current = err;
          let isFirst = true;

          while (current) {
            const serialized = {
              name: current.name,
              message: current.message,
              ...(isFirst &&
                this.pino.level === 'debug' && {
                  stack: current.stack
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

    const devOptions = dev
      ? {
          level: 'debug',
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true
            }
          }
        }
      : {};

    this.pino = pino({ ...baseOptions, ...devOptions, ...options });
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
