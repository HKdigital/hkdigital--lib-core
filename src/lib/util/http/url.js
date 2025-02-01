import { TypeOrValueError } from '$lib/constants/errors/index.js';

/**
 * Returns an URL instance
 * - Prefixes the URL with the current orign if the url is relative
 *
 * @param {string|URL} url
 *
 * @returns {URL} url instance
 */
export function toURL(url) {
	if (typeof url === 'string') {
		if (hasProtocol(url)) {
			return new URL(url);
		} else {
			// Use location.origin aas baseUrl
			return new URL(url, location.origin);
		}
	} else if (!(url instanceof URL)) {
		throw new TypeOrValueError('Missing or invalid parameter [url]');
	}

	// already an URL instance
	return url;
}

/**
 * Checks if the url starts with a protocol specification such
 * as https://
 *
 * @param {string} url
 *
 * @return {boolean} true if the value looks like an array
 */
export function hasProtocol(url) {
	if (/^([a-zA-Z]{2,})s?:\/\//.test(url)) {
		return true;
	}

	return false;
}

/**
 * Convert an url to an absolute url and apply decodeURI to
 * convert URI encoded characters to normal characters
 *
 * @param {string|URL} url
 */
export function href(url) {
	const urlObj = toURL(url);
	return decodeURI(urlObj.href);
}
