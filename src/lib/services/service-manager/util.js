/**
 * @fileoverview Service Manager utility functions
 *
 * Provides utility functions for parsing service configurations, handling
 * log level hierarchies, and managing service-specific operations.
 */

import { DEBUG, INFO, WARN, ERROR } from '$lib/logging/common.js';

/** @typedef {import('$lib/logging/typedef.js').LogLevel} LogLevel */

/**
 * Parse comma-separated service:level configuration string
 *
 * @param {string} configString
 *   Comma-separated string like "auth:debug,database:info,cache:warn"
 *
 * @returns {Record<string, LogLevel>} Service name to log level mapping
 *
 * @example
 * const config = parseServiceLogLevels("auth:debug,database:info");
 * // Returns: { auth: "debug", database: "info" }
 */
export function parseServiceLogLevels(configString) {
  if (!configString || typeof configString !== 'string') {
    /** @type {Record<string, LogLevel>} */
    return {};
  }

  /** @type {Record<string, LogLevel>} */
  const result = {};

  const services = configString.split(',');

  for (const serviceExpression of services) {
    const trimmed = serviceExpression.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(':');
    if (parts.length === 2) {
      const [serviceName, logLevel] = parts;
      result[serviceName.trim()] = /** @type {LogLevel} */ (logLevel.trim());
    }
  }

  return result;
}

/**
 * Expand log levels to include higher severity levels
 *
 * @param {{[name:string]: string}} serviceLevels
 *   Service name to log level mapping
 *
 * @returns {Object<string, string[]>} Service name to array of log levels
 *
 * @example
 * const levels = expandLogLevels({ auth: "debug", cache: "warn" });
 * // Returns: { 
 * //   auth: ["debug", "info", "warn", "error"],
 * //   cache: ["warn", "error"] 
 * // }
 */
export function expandLogLevels(serviceLevels) {
  /** @type {Object<string, string[]>} */
  const result = {};

  for (const [serviceName, level] of Object.entries(serviceLevels)) {
    const levels = [];
    
    switch (level.toLowerCase()) {
      case DEBUG:
        levels.push(DEBUG, INFO, WARN, ERROR);
        break;
      case INFO:
        levels.push(INFO, WARN, ERROR);
        break;
      case WARN:
        levels.push(WARN, ERROR);
        break;
      case ERROR:
        levels.push(ERROR);
        break;
      default:
        levels.push(level);
    }

    result[serviceName] = levels;
  }

  return result;
}
