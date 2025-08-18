import * as expect from '$lib/util/expect.js';

/**
 * Remove strange characters from a string and replace whitespace by
 * dashes.
 *
 * @returns {string} string that can be used as uri
 */
export function toUriName(str) {
  expect.string(str);

  str = str.toLowerCase().replace(/[^a-z0-9]+/gi, '-');

  // TODO: remove duplicate dashes

  return str;
}

/**
 * Captizalize the first character of a string
 *
 * @param {string} str - Input string
 *
 * @returns {string} string with first letter capitalized
 */
export function capitalizeFirst(str) {
  if (!str.length) {
    return str;
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a kebab-case string to Title Case.
 *
 * @param {string} kebabString - The kebab-case string to convert
 * @return {string} The converted Title Case string
 */
export function kebabToTitleCase(kebabString) {
  // Check if input is a string
  if (typeof kebabString !== 'string') {
    throw new Error('Input must be a string');
  }

  // Split the string by hyphens
  return kebabString
    .split('-')
    .map((word) => {
      // Capitalize the first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}
