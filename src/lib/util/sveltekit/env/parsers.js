/**
 * @fileoverview Environment variable parsing utilities
 *
 * Provides functions for parsing and transforming environment variables
 * with type conversion, key transformation, and prefix handling.
 *
 * @example
 * import { parseEnv, parseEnvByPrefix } from '$lib/util/sveltekit/env/parsers.js';
 *
 * const parsed = parseEnv(envObject, {
 *   camelCase: true,
 *   parseValues: true
 * });
 *
 * const dbConfig = parseEnvByPrefix(envObject, 'DATABASE');
 */

/**
 * Parse environment object with type conversion and key transformation
 *
 * @param {Object<string, string>} env - Raw environment variables
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.camelCase=true]
 *   Convert env var names to camelCase object keys
 * @param {boolean} [options.parseValues=true]
 *   Parse string values to numbers/booleans when possible
 * @param {string} [options.prefix] - Only include vars with this prefix
 * @param {boolean} [options.removePrefix=true]
 *   Remove prefix from resulting keys
 *
 * @returns {Object} Parsed environment object
 */
export function parseEnv(env, options = {}) {
  const {
    camelCase = true,
    parseValues = true,
    prefix,
    removePrefix = true
  } = options;

  const result = {};

  for (const [key, value] of Object.entries(env || {})) {
    // Skip if prefix specified and key doesn't match
    if (prefix && !key.startsWith(prefix)) {
      continue;
    }

    // Determine final key name
    let finalKey = key;
    
    if (prefix && removePrefix) {
      finalKey = key.slice(prefix.length);
      // Remove leading underscore if present
      if (finalKey.startsWith('_')) {
        finalKey = finalKey.slice(1);
      }
    }
    
    if (camelCase) {
      finalKey = toCamelCase(finalKey);
    } else {
      finalKey = finalKey.toLowerCase();
    }

    // Parse value if requested
    result[finalKey] = parseValues ? parseValue(value) : value;
  }

  return result;
}

/**
 * Parse environment variables by prefix
 *
 * @param {Object<string, string>} env - Raw environment variables
 * @param {string} prefix - Environment variable prefix (e.g., 'DATABASE')
 * @param {Object} [options={}] - Parsing options
 *
 * @returns {Object} Parsed configuration object
 */
export function parseEnvByPrefix(env, prefix, options = {}) {
  const prefixWithUnderscore = prefix.endsWith('_') ? prefix : `${prefix}_`;
  
  return parseEnv(env, {
    ...options,
    prefix: prefixWithUnderscore,
    removePrefix: true
  });
}

/**
 * Convert SCREAMING_SNAKE_CASE to camelCase
 *
 * @param {string} str - String to convert
 *
 * @returns {string} camelCase string
 */
export function toCamelCase(str) {
  return str
    .toLowerCase()
    .split('_')
    .map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('');
}

/**
 * Parse string value to appropriate type
 *
 * @param {string} value - String value to parse
 *
 * @returns {*} Parsed value (string, number, boolean, or null)
 */
export function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;

  // Try parsing as number
  const num = Number(value);
  if (!Number.isNaN(num) && value.trim() !== '') {
    return num;
  }

  return value;
}

/**
 * Auto-detect and group environment variables by prefixes
 *
 * Automatically detects prefixes from environment variable names and groups
 * them into configuration objects. All variables with underscores are 
 * grouped by their prefix (the part before the first underscore).
 *
 * @param {Object<string, string>} env - Raw environment variables
 * @param {Object} [options={}] - Parsing options
 * @param {boolean} [options.camelCase=true]
 *   Convert env var names to camelCase object keys
 * @param {boolean} [options.parseValues=true]
 *   Parse string values to numbers/booleans when possible
 *
 * @returns {Object<string, Object>} Grouped environment variables
 *
 * @example
 * // Input env vars:
 * // DATABASE_HOST=localhost, DATABASE_PORT=5432
 * // REDIS_HOST=cache, API_KEY=secret, SINGLE=value
 *
 * const grouped = autoGroupEnvByPrefix(env);
 * // Returns: 
 * // {
 * //   database: { host: 'localhost', port: 5432 },
 * //   redis: { host: 'cache' },
 * //   api: { key: 'secret' },
 * //   single: 'value'  // No underscore, stays top-level
 * // }
 */
export function autoGroupEnvByPrefix(env, options = {}) {
  const {
    camelCase = true,
    parseValues = true
  } = options;

  // Collect all prefixes from variables with underscores
  const allPrefixes = new Set();

  for (const key of Object.keys(env)) {
    const parts = key.split('_');
    if (parts.length > 1) {
      const prefix = parts[0];
      allPrefixes.add(prefix);
    }
  }

  const result = {};
  const usedKeys = new Set();

  // Group by all detected prefixes
  for (const prefix of allPrefixes) {
    const groupKey = camelCase ? toCamelCase(prefix) : prefix.toLowerCase();
    const groupConfig = parseEnvByPrefix(env, prefix, { camelCase, parseValues });
    
    if (Object.keys(groupConfig).length > 0) {
      result[groupKey] = groupConfig;
      
      // Mark keys as used
      for (const key of Object.keys(env)) {
        if (key.startsWith(`${prefix}_`)) {
          usedKeys.add(key);
        }
      }
    }
  }

  // Add remaining variables (no underscore) as top-level properties
  for (const [key, value] of Object.entries(env)) {
    if (!usedKeys.has(key)) {
      const finalKey = camelCase ? toCamelCase(key) : key.toLowerCase();
      result[finalKey] = parseValues ? parseValue(value) : value;
    }
  }

  return result;
}

/**
 * Group environment variables by specific prefixes
 *
 * @param {Object<string, string>} env - Raw environment variables
 * @param {string[]} prefixes - Array of prefixes to group by
 * @param {Object} [options={}] - Parsing options
 *
 * @returns {Object<string, Object>} Grouped environment variables
 *
 * @example
 * const grouped = groupEnvByPrefixes(env, ['DATABASE', 'REDIS', 'JWT']);
 * // Returns: { database: {...}, redis: {...}, jwt: {...} }
 */
export function groupEnvByPrefixes(env, prefixes, options = {}) {
  const result = {};
  
  for (const prefix of prefixes) {
    const groupKey = options.camelCase !== false ? 
                     toCamelCase(prefix) : 
                     prefix.toLowerCase();
    
    result[groupKey] = parseEnvByPrefix(env, prefix, options);
  }
  
  return result;
}

/**
 * Filter environment variables by pattern
 *
 * @param {Object<string, string>} env - Raw environment variables
 * @param {RegExp|string} pattern - Pattern to match against keys
 * @param {Object} [options={}] - Parsing options
 *
 * @returns {Object} Filtered and parsed environment variables
 */
export function filterEnvByPattern(env, pattern, options = {}) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  /** @type {Object<string, string>} */
  const filtered = {};
  
  for (const [key, value] of Object.entries(env || {})) {
    if (regex.test(key)) {
      filtered[key] = value;
    }
  }
  
  return parseEnv(filtered, options);
}