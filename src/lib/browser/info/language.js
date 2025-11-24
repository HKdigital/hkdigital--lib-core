/**
 * Get browser language
 *
 * @example
 * // 'en-US', 'nl-NL', 'fr-FR', 'de-DE'
 *
 * @returns {string} browser language code
 */
export function getLanguage() {
  return navigator.language || 'en';
}

/**
 * Get all preferred languages
 *
 * @example
 * // ['en-US', 'en', 'nl-NL']
 *
 * @returns {string[]} array of language codes
 */
export function getLanguages() {
  return navigator.languages || [navigator.language || 'en'];
}
