import { Logger } from '$lib/logging/internal/logger.js';
import { ConsoleAdapter } from '$lib/logging/internal/adapters/console.js';
import { DEBUG, LOG, LEVELS } from '$lib/logging/levels.js';

/**
 * Create a client-side logger with console adapter
 *
 * @param {string} name
 *
 * @param {import('$lib/logging/typedef.js').LogLevel} level
 *  Initial log level
 *
 * @param {Object} [consoleOptions] - Additional console options
 *
 * @returns {Logger} Configured logger instance
 */
export function createClientLogger(name, level, consoleOptions = {}) {

  if( !level || !LEVELS[level] ) {
    throw new Error('Missing or invalid parameter [level]');
  }

  const logger = new Logger(name, level);
  const adapter = new ConsoleAdapter({ ...consoleOptions, level });

  // Connect adapter to logger events
  // @ts-ignore (just accept logEvent)
  logger.on(LOG, (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
