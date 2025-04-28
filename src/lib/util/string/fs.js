/**
 * Path utilities for working with file and directory paths.
 * Provides functions similar to Node.js path module but for browser and SvelteKit use.
 */

/**
 * Extracts the filename from a path, with or without extension.
 *
 * @param {string} path - The path to extract the filename from
 * @param {boolean} [includeExtension=true] - Whether to include the extension
 * @return {string} The extracted filename
 */
export function basename(path, includeExtension = true) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  // Handle empty string
  if (path === '') {
    return '';
  }

  // Remove trailing slashes
  path = path.replace(/\/+$/, '');

  // Find the last occurrence of '/'
  const lastSlashIndex = path.lastIndexOf('/');

  // Get the full filename
  const filename =
    lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);

  // Return the full filename if extension should be included
  if (includeExtension) {
    return filename;
  }

  // Otherwise, remove the extension
  const lastDotIndex = filename.lastIndexOf('.');

  // If no dot is found or dot is the first character (hidden file), return the filename
  if (lastDotIndex <= 0) {
    return filename;
  }

  // Return everything before the last dot
  return filename.substring(0, lastDotIndex);
}

/**
 * Extracts the extension from a filename.
 *
 * @param {string} path - The path to extract the extension from
 * @param {boolean} [includeDot=false] - Whether to include the dot in the extension
 * @return {string} The extracted extension
 */
export function extname(path, includeDot = false) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  const filename = basename(path);
  const lastDotIndex = filename.lastIndexOf('.');

  // If no dot is found or dot is the first character (hidden file), return empty string
  if (lastDotIndex <= 0) {
    return '';
  }

  // Return the extension with or without the dot
  return includeDot
    ? filename.substring(lastDotIndex)
    : filename.substring(lastDotIndex + 1);
}

/**
 * Extracts the directory name from a path.
 *
 * @param {string} path - The path to extract the directory name from
 * @return {string} The extracted directory name
 */
export function dirname(path) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  // Handle empty string
  if (path === '') {
    return '.';
  }

  // Remove trailing slashes
  path = path.replace(/\/+$/, '');

  // Find the last occurrence of '/'
  const lastSlashIndex = path.lastIndexOf('/');

  // If no slash is found, return '.'
  if (lastSlashIndex === -1) {
    return '.';
  }

  // If slash is at the beginning, return '/'
  if (lastSlashIndex === 0) {
    return '/';
  }

  // Return everything before the last slash
  return path.substring(0, lastSlashIndex);
}

/**
 * Joins path segments with the appropriate separator.
 *
 * @param {...string} paths - The path segments to join
 * @return {string} The joined path
 */
export function join(...paths) {
  if (paths.length === 0) {
    return '.';
  }

  return paths
    .filter((segment) => typeof segment === 'string' && segment !== '')
    .join('/')
    .replace(/\/+/g, '/'); // Replace multiple consecutive slashes with a single one
}

/**
 * Normalizes a path by resolving '..' and '.' segments.
 *
 * @param {string} path - The path to normalize
 * @return {string} The normalized path
 */
export function normalize(path) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  // Replace backslashes with forward slashes
  path = path.replace(/\\/g, '/');

  // Handle empty string
  if (path === '') {
    return '.';
  }

  const isAbsolute = path.startsWith('/');
  const trailingSlash = path.endsWith('/');

  // Split path into segments
  const segments = path.split('/').filter(Boolean);
  const resultSegments = [];

  for (const segment of segments) {
    if (segment === '.') {
      // Ignore current directory marker
      continue;
    } else if (segment === '..') {
      // Go up one directory
      if (
        resultSegments.length > 0 &&
        resultSegments[resultSegments.length - 1] !== '..'
      ) {
        resultSegments.pop();
      } else if (!isAbsolute) {
        resultSegments.push('..');
      }
    } else {
      // Add segment to result
      resultSegments.push(segment);
    }
  }

  // Handle empty result
  if (resultSegments.length === 0) {
    return isAbsolute ? '/' : '.';
  }

  // Join segments
  let result = resultSegments.join('/');

  // Add leading slash for absolute paths
  if (isAbsolute) {
    result = '/' + result;
  }

  // Add trailing slash if original path had one
  if (trailingSlash && !result.endsWith('/')) {
    result += '/';
  }

  return result;
}

/**
 * Checks if a path is absolute.
 *
 * @param {string} path - The path to check
 * @return {boolean} Whether the path is absolute
 */
export function isAbsolute(path) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  return path.startsWith('/');
}

/**
 * Returns the path segments as an array.
 *
 * @param {string} path - The path to split
 * @return {string[]} The path segments
 */
export function segments(path) {
  if (typeof path !== 'string') {
    throw new Error('Path must be a string');
  }

  // Normalize path first
  const normalizedPath = normalize(path);

  // Split path into segments
  return normalizedPath.split('/').filter(Boolean);
}
