/**
 * @fileoverview Public environment variables access
 *
 * Provides access to SvelteKit public environment variables with parsing.
 * Safe to use on both client and server side.
 *
 * @example
 * import { getPublicEnv } from '$lib/util/sveltekit/env/public.js';
 *
 * const publicVars = getPublicEnv();
 * const apiConfig = getPublicEnv({ prefix: 'PUBLIC_API' });
 */

import { env } from '$env/dynamic/public';
import { autoGroupEnvByPrefix, parseEnv } from './parsers.js';

/**
 * Get all public environment variables with automatic prefix grouping
 *
 * Automatically detects common prefixes in public environment variables
 * and groups them into configuration objects. This makes it easy to
 * organize related configuration values.
 *
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.camelCase=true]
 *   Convert env var names to camelCase object keys
 * @param {boolean} [options.parseValues=true]
 *   Parse string values to numbers/booleans when possible
 * @param {boolean} [options.autoGroup=true]
 *   Enable automatic prefix grouping
 *
 * @returns {Object} Grouped and parsed public environment variables
 *
 * @example
 * // Environment variables:
 * // PUBLIC_API_URL=https://api.example.com
 * // PUBLIC_API_TIMEOUT=5000
 * // PUBLIC_FEATURE_FLAGS=true
 *
 * const config = getPublicEnv();
 * // Returns:
 * // {
 * //   publicApi: { url: 'https://api.example.com', timeout: 5000 },
 * //   publicFeatureFlags: true
 * // }
 */
export function getPublicEnv(options = {}) {
  const { autoGroup = true, ...parseOptions } = options;
  
  if (autoGroup) {
    return autoGroupEnvByPrefix(env, parseOptions);
  }
  
  return parseEnv(env, parseOptions);
}

/**
 * Get public environment variables by prefix
 *
 * @param {string} prefix - Environment variable prefix (e.g., 'PUBLIC_API')
 * @param {Object} [options={}] - Parsing options
 *
 * @returns {Object} Parsed configuration object
 */
export function getPublicEnvByPrefix(prefix, options = {}) {
  const prefixWithUnderscore = prefix.endsWith('_') ? prefix : `${prefix}_`;
  
  return parseEnv(env, {
    ...options,
    prefix: prefixWithUnderscore,
    removePrefix: true
  });
}

/**
 * Get raw public environment variables (no parsing)
 *
 * @returns {Object<string, string>} Raw public environment variables
 */
export function getRawPublicEnv() {
  return { ...env };
}