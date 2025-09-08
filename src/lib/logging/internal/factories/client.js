import { Logger } from '$lib/logging/internal/logger/index.js';
import { ConsoleAdapter } from '$lib/logging/internal/adapters/console.js';
import { INFO, LOG } from '$lib/logging/levels.js';

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
  logger.on(LOG, (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
