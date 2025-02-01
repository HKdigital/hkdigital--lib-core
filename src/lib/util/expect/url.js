// > Imports

import * as v from 'valibot';

import {
	ValidateUrl,
	ValidateUrlOrEmptyString,
	ValidateUrlPath,
	ValidateRelativeUrl,
	ValidateAbsOrRelUrl
} from '$lib/schemas/validate-url.js';

// > Exports

/**
 * Throws a validation error if value is not an url
 *
 * @param {any} value
 */
export function url(value) {
	v.parse(ValidateUrl, value);
}

/**
 * Throws a validation error if value is not an url or
 * an empty string
 *
 * @param {any} value
 */
export function urlOrEmptyString(value) {
	v.parse(ValidateUrlOrEmptyString, value);
}

/**
 * Throws a validation error if value is not a relative url
 *
 * @param {any} value
 */
export function urlPath(value) {
	v.parse(ValidateUrlPath, value);
}

/**
 * Throws a validation error if value is not a relative url
 *
 * @param {any} value
 */
export function relativeUrl(value) {
	v.parse(ValidateRelativeUrl, value);
}

/**
 * Throws a validation error if value is not an absolute
 * or relative url
 *
 * @param {any} value
 */
export function absOrRelUrl(value) {
	v.parse(ValidateAbsOrRelUrl, value);
}
