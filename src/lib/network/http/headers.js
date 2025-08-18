import * as expect from '$lib/util/expect.js';

/**
 * Set headers in an existing `Headers` object
 *
 * This function adds or updates headers in an existing Headers object.
 * Existing headers with the same name will be overwritten.
 * The supplied `Headers` object will be updated in place.
 *
 * @param {Headers} target
 *   Headers object to set the extra headers in
 *
 * @param {null|object|[string, string][]} [pairs]
 *   Headers to add, can be null, an object of name-value pairs,
 *   or an array of [name, value] pairs
 *
 * @throws {Error} If target is not a Headers object
 * @throws {Error} If pairs is a Headers object
 * @throws {Error} If pairs is not null, object, or array
 * @throws {Error} If any header name or value is empty
 *
 * @example
 * // Add headers from an object
 * const headers = new Headers();
 * setRequestHeaders(headers, {
 *   'content-type': 'application/json',
 *   'accept': 'application/json'
 * });
 *
 * @example
 * // Add headers from an array of pairs
 * const headers = new Headers();
 * setRequestHeaders(headers, [
 *   ['content-type', 'application/json'],
 *   ['authorization', 'Bearer token123']
 * ]);
 *
 * @example
 * // Passing null is valid and does nothing
 * setRequestHeaders(headers, null);
 */
export function setRequestHeaders(target, pairs) {
  if (!(target instanceof Headers)) {
    throw new Error('Invalid parameter [target] (expected Headers object)');
  }

  // expect.objectNoArray(pairs);

  if (pairs instanceof Headers) {
    throw new Error(
    	'Invalid parameter [pairs] (should not be a Headers object)');
  }

  if (!pairs) {
    return;
  }

  if (typeof pairs !== 'object') {
    throw new Error('Invalid value for parameter [pairs]');
  }

  if (!Array.isArray(pairs)) {
    pairs = Object.entries(pairs);
  }

  for (const [name, value] of pairs) {
    expect.notEmptyString(name);
    expect.notEmptyString(value);

    // @note Headers should be encoded lowercase in HTTP2
    const nameLower = name.toLowerCase();

    target.set(nameLower, value); /* overwrites existing value */
  }
}
