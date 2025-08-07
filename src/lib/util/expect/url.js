// > Imports

import * as v from 'valibot';

import {
	HumanUrl,
	UrlOrEmptyString,
	UrlPath,
	RelativeUrl,
	AbsOrRelUrl
} from '$lib/valibot/parsers.js';

// > Exports

/**
 * Throws a parse error if value is not a URL
 *
 * @param {any} value
 */
export function expect_url(value) {
	v.parse(HumanUrl, value);
}

export { expect_url as url };

/**
 * Throws a parse error if value is not a URL or
 * an empty string
 *
 * @param {any} value
 */
export function expect_urlOrEmptyString(value) {
	v.parse(UrlOrEmptyString, value);
}

export { expect_urlOrEmptyString as urlOrEmptyString };

/**
 * Throws a parse error if value is not a URL path
 *
 * @param {any} value
 */
export function expect_urlPath(value) {
	v.parse(UrlPath, value);
}

export { expect_urlPath as urlPath };

/**
 * Throws a parse error if value is not a relative URL
 *
 * @param {any} value
 */
export function expect_relativeUrl(value) {
	v.parse(RelativeUrl, value);
}

export { expect_relativeUrl as relativeUrl };

/**
 * Throws a parse error if value is not an absolute
 * or relative URL
 *
 * @param {any} value
 */
export function expect_absOrRelUrl(value) {
	v.parse(AbsOrRelUrl, value);
}

export { expect_absOrRelUrl as absOrRelUrl };
