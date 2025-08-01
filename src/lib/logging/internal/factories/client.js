import { Logger } from '$lib/logging/internal/unified-logger';
import { ConsoleAdapter } from '$lib/logging/internal/adapters/console.js';
import { INFO } from '$lib/logging/internal/unified-logger/constants.js';

/**
 * Create a client-side logger with console adapter
 *
 * @param {string} name
 * @param {string} [level=INFO] - Initial log level
 * @param {Object} [consoleOptions] - Additional console options
 * @returns {Logger} Configured logger instance
 */
export function createClientLogger(name, level = INFO, consoleOptions = {}) {
  const logger = new Logger(name, level);
  const adapter = new ConsoleAdapter({ ...consoleOptions, level });

  // Connect adapter to logger events
  logger.on('log', (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
