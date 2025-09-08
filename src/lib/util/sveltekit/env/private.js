/**
 * @fileoverview Private environment variables access (server-side only)
 *
 * Provides access to SvelteKit private environment variables with parsing.
 * IMPORTANT: This module can only be imported on the server side.
 * Attempting to import this on the client will cause a build error.
 *
 * @example
 * import { getPrivateEnv } from '$lib/util/sveltekit/env/private.js';
 *
 * const privateVars = getPrivateEnv();
 * const dbConfig = getPrivateEnv({ prefix: 'DATABASE' });
 */

import { env } from '$env/dynamic/private';
import { autoGroupEnvByPrefix, parseEnv } from './parsers.js';

/**
 * Get all private environment variables with automatic prefix grouping
 *
 * Automatically detects common prefixes in private environment variables
 * and groups them into configuration objects. This is perfect for organizing
 * database connections, API keys, and other sensitive configuration.
 *
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.camelCase=true]
 *   Convert env var names to camelCase object keys
 * @param {boolean} [options.parseValues=true]
 *   Parse string values to numbers/booleans when possible
 * @param {boolean} [options.autoGroup=true]
 *   Enable automatic prefix grouping
 *
 * @returns {Record<string, any>} Grouped and parsed private environment variables
 *
 * @example
 * // Environment variables:
 * // DATABASE_HOST=localhost
 * // DATABASE_PORT=5432
 * // DATABASE_NAME=myapp
 * // REDIS_URL=redis://localhost:6379
 * // JWT_SECRET=mysecret
 * // JWT_EXPIRES_IN=24h
 *
 * const config = getPrivateEnv();
 * // Returns:
 * // {
 * //   database: { host: 'localhost', port: 5432, name: 'myapp' },
 * //   jwt: { secret: 'mysecret', expiresIn: '24h' },
 * //   redisUrl: 'redis://localhost:6379'  // Single vars become top-level
 * // }
 */
export function getPrivateEnv(options = {}) {
  const { autoGroup = true, ...parseOptions } = options;
  
  if (autoGroup) {
    return autoGroupEnvByPrefix(env, parseOptions);
  }
  
  return parseEnv(env, parseOptions);
}

/**
 * Get private environment variables by prefix
 *
 * @param {string} prefix - Environment variable prefix (e.g., 'DATABASE')
 * @param {Object} [options={}] - Parsing options
 *
 * @returns {Record<string, any>} Parsed configuration object
 */
export function getPrivateEnvByPrefix(prefix, options = {}) {
  const prefixWithUnderscore = prefix.endsWith('_') ? prefix : `${prefix}_`;
  
  return parseEnv(env, {
    ...options,
    prefix: prefixWithUnderscore,
    removePrefix: true
  });
}

/**
 * Get raw private environment variables (no parsing)
 *
 * @returns {Record<string, string|undefined>} Raw private environment variables
 */
export function getRawPrivateEnv() {
  return { ...env };
}
