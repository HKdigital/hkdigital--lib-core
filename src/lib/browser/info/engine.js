/**
 * Get browser rendering engine
 *
 * @example
 * // Firefox: 'gecko'
 * // Chrome, Edge, Brave, Vivaldi, Arc: 'blink'
 * // Safari: 'webkit'
 *
 * @returns {'blink'|'gecko'|'webkit'|'unknown'} browser engine
 */
export function getBrowserEngine() {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox/')) return 'gecko';
  if (ua.includes('Edg/')) return 'blink';
  if (ua.includes('Chrome/')) return 'blink';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'webkit';

  return 'unknown';
}

/**
 * Get simplified browser name
 *
 * @example
 * // 'Firefox', 'Edge', 'Safari', 'Chromium' (Chrome/Brave/Vivaldi/Arc)
 *
 * @returns {string} browser name
 */
export function getBrowserName() {
  const ua = navigator.userAgent;

  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  if (ua.includes('Chrome/')) return 'Chromium';

  return 'Unknown';
}

/**
 * Get browser vendor
 *
 * @example
 * // 'Google Inc.', 'Apple Computer, Inc.', ''
 *
 * @returns {string} browser vendor
 */
export function getVendor() {
  return navigator.vendor || '';
}

/**
 * Get user agent string
 *
 * @example
 * // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...'
 * // 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)...'
 *
 * @returns {string} user agent
 */
export function getUserAgent() {
  return navigator.userAgent;
}
