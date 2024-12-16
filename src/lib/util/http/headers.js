import * as expect from '../expect/index.js';

/**
 * Set headers in an existing `Headers` object
 * - Existing headers with the same name will be overwritten
 * - The supplied `Headers` object will be updated, this function does not
 *   return any value
 *
 * @param {Headers} target - Headers object to set the extra headers in
 *
 * @param {object} [nameValuePairs]
 *   Object that contains custom headers. A header is a name, value pair.
 */
export function setRequestHeaders(target, nameValuePairs) {
	if (!(target instanceof Headers)) {
		throw new Error('Invalid parameter [target] (expected Headers object)');
	}

	expect.objectNoArray(nameValuePairs);

	if (nameValuePairs instanceof Headers) {
		throw new Error('Invalid parameter [nameValuePairs] (should not be a Headers object)');
	}

	for (const name in nameValuePairs) {
		expect.notEmptyString(name);

		const value = nameValuePairs[name];

		expect.notEmptyString(value);

		//
		// Headers should be encoded lowercase in HTTP2
		//
		const nameLower = name.toLowerCase();

		target.set(nameLower, value); /* overwrites existing value */
	}
}
