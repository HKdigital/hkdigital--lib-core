import { Logger } from '$lib/classes/logging';
import { ConsoleAdapter } from '../adapters/console.js';
import { INFO } from '../constants.js';

/**
 * Create a client-side logger with console adapter
 *
 * @param {string} serviceName - Name of the service
 * @param {string} [level=INFO] - Initial log level
 * @param {Object} [consoleOptions] - Additional console options
 * @returns {Logger} Configured logger instance
 */
export function createClientLogger(serviceName, level = INFO, consoleOptions = {}) {
  const logger = new Logger(serviceName, level);
  const adapter = new ConsoleAdapter({ ...consoleOptions, level });

  // Connect adapter to logger events
  logger.on('log', (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
