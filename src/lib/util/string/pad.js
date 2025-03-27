/**
 * Prefix a numeric string with 0's
 *
 * @param {string|number} input
 *
 * @returns {string}
 */
export function padDigits(input, targetLength = 2, padString = '0') {
  return ('' + input).padStart(targetLength, padString);
}
