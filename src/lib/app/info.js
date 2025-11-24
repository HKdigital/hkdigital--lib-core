/**
 * Application version from environment variables
 *
 * @type {string}
 */
export const appVersion = import.meta.env.VITE_APP_VERSION || '0.0.0';

/**
 * Build timestamp from environment variables
 *
 * @type {string}
 */
export const buildTimestamp = import.meta.env.VITE_BUILD_TIMESTAMP ?? '';

/**
 * @typedef {import('./typedef.js').AppInfo} AppInfo
 */

/**
 * Get application information
 *
 * @returns {AppInfo} app info
 *
 * @example
 * const appInfo = getAppInfo();
 * // { appVersion: '1.2.3', buildTimestamp: '2025-01-15T10:30:00Z' }
 */
export function getAppInfo() {
  return {
    appVersion,
    buildTimestamp
  };
}
