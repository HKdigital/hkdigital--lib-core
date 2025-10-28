/**
 * Get simplified platform identifier
 *
 * @example
 * // 'macos', 'windows', 'linux', 'ios', 'android', 'unknown'
 *
 * @returns {string} platform identifier
 */
export function getPlatform() {
  const platform = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();

  // iOS devices
  if (/iphone|ipod|ipad/.test(platform)) {
    return 'ios';
  }

  // iPadOS (reports as MacIntel but has touch)
  if (platform === 'macintel' && navigator.maxTouchPoints > 2) {
    return 'ios';
  }

  // Android
  if (/android/.test(ua)) {
    return 'android';
  }

  // macOS
  if (/mac/.test(platform)) {
    return 'macos';
  }

  // Windows
  if (/win/.test(platform)) {
    return 'windows';
  }

  // Linux
  if (/linux/.test(platform)) {
    return 'linux';
  }

  return 'unknown';
}

/**
 * Get raw platform string from navigator
 *
 * @example
 * // 'MacIntel', 'Win32', 'Linux x86_64', 'iPhone', 'iPad'
 *
 * @returns {string} raw platform identifier
 */
export function getPlatformRaw() {
  return navigator.platform;
}

/**
 * Get number of CPU cores (logical processors)
 *
 * @example
 * // Desktop: 8, 16, 24
 * // Mobile: 4, 6, 8
 * // Older devices: 2
 *
 * @returns {number} number of logical processors
 */
export function getCpuCores() {
  return navigator.hardwareConcurrency || 1;
}

/**
 * Check if device is online
 *
 * @example
 * // true (connected), false (offline)
 *
 * @returns {boolean} true if online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Get connection type if available (experimental API)
 *
 * @example
 * // '4g', '3g', 'slow-2g', 'wifi', null
 *
 * @returns {string|null} connection type or null
 */
export function getConnectionType() {
  // @ts-ignore
  const connection =
    navigator.connection ||
    // @ts-ignore
    navigator.mozConnection ||
    // @ts-ignore
    navigator.webkitConnection;

  return connection?.effectiveType || null;
}
