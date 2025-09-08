import { Logger } from '$lib/logging/internal/logger/index.js';
import { PinoAdapter } from '$lib/logging/internal/adapters/pino.js';
import { INFO, LOG } from '$lib/logging/levels.js';
// import { expectNoSSRContext } from '$lib/util/ssr/index.js';

/**
 * Create a server-side logger with pino adapter
 *
 * @param {string} name
 * @param {string} [level=INFO] - Initial log level
 * @param {Object} [pinoOptions] - Additional pino options
 * @returns {Logger} Configured logger instance
 */
export function createServerLogger(name, level = INFO, pinoOptions = {}) {
  // Guard against SSR serialization issues
  // expectNoSSRContext();

  const logger = new Logger(name, level);
  const adapter = new PinoAdapter(pinoOptions);

  // Connect adapter to logger events
  //
  // @note pino might fail if:
  //   pino tries to create a worker thread for pino-pretty before the
  //   development environment is fully ready, causing the transport target
  //   determination to fail
  //   -> Stop and start the dev server
  //
  logger.on(LOG, (logEvent) => adapter.handleLog(logEvent));

  return logger;
}
