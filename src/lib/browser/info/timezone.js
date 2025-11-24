/**
 * Get timezone offset in minutes
 *
 * @example
 * // UTC: 0
 * // PST (UTC-8): 480
 * // CET (UTC+1): -60
 *
 * @returns {number} timezone offset
 */
export function getTimezoneOffset() {
  return new Date().getTimezoneOffset();
}

/**
 * Get timezone name
 *
 * @example
 * // 'America/New_York', 'Europe/Amsterdam', 'Asia/Tokyo'
 *
 * @returns {string} timezone identifier
 */
export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
