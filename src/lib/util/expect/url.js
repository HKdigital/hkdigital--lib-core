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
export function url(value) {
	v.parse(HumanUrl, value);
}

/**
 * Throws a parse error if value is not a URL or
 * an empty string
 *
 * @param {any} value
 */
export function urlOrEmptyString(value) {
	v.parse(UrlOrEmptyString, value);
}

/**
 * Throws a parse error if value is not a URL path
 *
 * @param {any} value
 */
export function urlPath(value) {
	v.parse(UrlPath, value);
}

/**
 * Throws a parse error if value is not a relative URL
 *
 * @param {any} value
 */
export function relativeUrl(value) {
	v.parse(RelativeUrl, value);
}

/**
 * Throws a parse error if value is not an absolute
 * or relative URL
 *
 * @param {any} value
 */
export function absOrRelUrl(value) {
	v.parse(AbsOrRelUrl, value);
}
