import { Logger } from '$lib/logging/internal/unified-logger';

import { PinoAdapter } from '$lib/logging/internal/adapters/pino.js';
import { INFO } from '$lib/logging/internal/unified-logger/constants.js';

/**
 * Create a server-side logger with pino adapter
 *
 * @param {string} name
 * @param {string} [level=INFO] - Initial log level
 * @param {Object} [pinoOptions] - Additional pino options
 * @returns {Logger} Configured logger instance
 */
export function createServerLogger(name, level = INFO, pinoOptions = {}) {
  const logger = new Logger(name, level);
  const adapter = new PinoAdapter(pinoOptions);

  // Connect adapter to logger events
  logger.on('log', (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
