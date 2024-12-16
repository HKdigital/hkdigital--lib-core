import { TypeOrValueError } from '$lib/constants/errors/index.js';

/**
 * Ensure to return an URL instance
 *
 * @param {string|URL} url
 *
 * @returns {URL} url instance
 */
export function toURL(url) {
	if (typeof url === 'string') {
		return new URL(url);
	} else if (!(url instanceof URL)) {
		throw new TypeOrValueError('Missing or invalid parameter [url]');
	}

	// already an URL instance
	return url;
}
