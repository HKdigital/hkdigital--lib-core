/**
 * @fileoverview Combined environment variables access (server-side only)
 *
 * Provides access to both public and private SvelteKit environment variables.
 * IMPORTANT: This module can only be imported on the server side since it
 * imports private environment variables.
 *
 * @example
 * import { getAllEnv } from '$lib/util/sveltekit/env/all.js';
 *
 * const allVars = getAllEnv();
 * const dbConfig = getAllEnv({ prefix: 'DATABASE' });
 */

import { getPublicEnv, getRawPublicEnv } from './public.js';
import { getPrivateEnv, getRawPrivateEnv } from './private.js';
import { autoGroupEnvByPrefix } from './parsers.js';

/**
 * Get all environment variables (public + private) with automatic grouping
 *
 * Combines and automatically groups both public and private environment
 * variables. Private variables take precedence over public ones when
 * there are conflicts.
 *
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.camelCase=true]
 *   Convert env var names to camelCase object keys
 * @param {boolean} [options.parseValues=true]
 *   Parse string values to numbers/booleans when possible
 * @param {boolean} [options.autoGroup=true]
 *   Enable automatic prefix grouping
 *
 * @returns {Record<string, any>} Grouped and parsed combined environment variables
 *
 * @example
 * // Environment variables:
 * // PUBLIC_API_URL=https://api.example.com
 * // DATABASE_HOST=localhost
 * // DATABASE_PORT=5432
 * // SINGLE_FLAG=true
 *
 * const config = getAllEnv();
 * // Returns:
 * // {
 * //   database: { host: 'localhost', port: 5432 },
 * //   publicApiUrl: 'https://api.example.com',
 * //   singleFlag: true
 * // }
 */
export function getAllEnv(options = {}) {
  const { autoGroup = true, ...parseOptions } = options;
  
  if (autoGroup) {
    // Combine raw env vars first, then group
    const combinedRawEnv = { ...getRawPublicEnv(), ...getRawPrivateEnv() };
    return autoGroupEnvByPrefix(combinedRawEnv, parseOptions);
  }
  
  // No grouping - just combine parsed results
  const publicVars = getPublicEnv({ ...parseOptions, autoGroup: false });
  const privateVars = getPrivateEnv({ ...parseOptions, autoGroup: false });
  
  // Private variables take precedence over public ones
  return { ...publicVars, ...privateVars };
}

/**
 * Get raw combined environment variables (no parsing)
 *
 * @returns {Record<string, string|undefined>} Raw combined environment variables
 */
export function getRawAllEnv() {
  const publicVars = getRawPublicEnv();
  const privateVars = getRawPrivateEnv();
  
  // Private variables take precedence over public ones
  return { ...publicVars, ...privateVars };
}
