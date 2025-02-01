import * as expect from '../expect/index.js';

/**
 * Set headers in an existing `Headers` object
 * - Existing headers with the same name will be overwritten
 * - The supplied `Headers` object will be updated, this function does not
 *   return any value
 *
 * @param {Headers} target - Headers object to set the extra headers in
 *
 * @param {null|object|[string, string][]} [pairs]
 */
export function setRequestHeaders(target, pairs) {
	if (!(target instanceof Headers)) {
		throw new Error('Invalid parameter [target] (expected Headers object)');
	}

	// expect.objectNoArray(pairs);

	if (pairs instanceof Headers) {
		throw new Error('Invalid parameter [pairs] (should not be a Headers object)');
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
