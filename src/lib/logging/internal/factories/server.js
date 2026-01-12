import { Logger } from '$lib/logging/internal/logger.js';
import { PinoAdapter } from '$lib/logging/internal/adapters/pino.js';
import { LOG, LEVELS } from '$lib/logging/levels.js';

/**
 * Create a server-side logger with pino adapter
 *
 * @param {string} name
 *
 * @param {import('$lib/logging/typedef.js').LogLevel} level
 *  Initial log level
 *
 * @param {Object} [pinoOptions] - Additional pino options
 *
 * @returns {Logger} Configured logger instance
 */
export function createServerLogger(name, level, pinoOptions = {}) {

  if( !level || !LEVELS[level] ) {
    throw new Error('Missing or invalid parameter [level]');
  }

  const logger = new Logger(name, level);
  const adapter = new PinoAdapter(pinoOptions);

  // Connect adapter to logger events
  // @ts-ignore (just accept logEvent)
  logger.on(LOG, (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
