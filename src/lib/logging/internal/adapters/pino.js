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
    const defaultOptions = dev
      ? {
          level: 'debug',
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
                chain.push(serialized);
                current = current.cause;
                isFirst = false;
              }

              return { errorChain: chain };
            }
          },
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true
            }
          }
        }
      : {};

    this.pino = pino({ ...defaultOptions, ...options });
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
      timestamp,
      ...(details && { details })
    };

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
