/**
 * Universal logger factory that auto-detects environment
 */
import { browser } from '$app/environment';
import { createServerLogger } from './server.js';
import { createClientLogger } from './client.js';

/**
 * Create a logger that works in both server and client environments
 *
 * @param {string} serviceName - Name of the service
 * @param {string} [level] - Initial log level
 * @param {Object} [options] - Additional options
 * @returns {import('../unified-logger').Logger} Configured logger instance
 */
export function createLogger(serviceName, level, options = {}) {
  if (browser) {
    return createClientLogger(serviceName, level, options);
  } else {
    return createServerLogger(serviceName, level, options);
  }
}
