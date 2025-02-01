// > Imports

import * as v from 'valibot';

// > Exports

/**
 * Schema to validate an URL or empty string.
 */
export const UrlOrEmptyString = v.pipe(
	v.pipe(v.string(), v.trim()),
	v.union([v.literal(''), v.pipe(v.string(), v.url())])
);

/**
 * Schema to validate an url that may miss the protocol part
 *
 * @note an empty string is not allowed!
 */
export const HumanUrl = v.pipe(
	v.string(),
	v.trim(),
	v.transform((value) => {
		if (!value.length || value.includes('://')) {
			return value;
		} else {
			// Prefix 'url' with 'https://'
			return `https://${value}`;
		}
	}),
	v.url()
);

/**
 * Schema to validate url path, without a search and hash part
 */
export const UrlPath = v.pipe(
	v.string(),
	v.transform((value) => {
		// Convert relative url to URL object
		// @note removes ../../ parts
		try {
			return new URL(value, 'http://localhost');

			// eslint-disable-next-line no-unused-vars
		} catch (e) {
			return null;
		}
	}),
	v.custom((urlOrNull) => {
		return urlOrNull ? true : false;
	}, 'Invalid URL pathname'),
	v.transform((url) => {
		return url.pathname;
	})
);

/**
 * Schema to validate a url path, which consists of
 * a path and optionally search and hash parts
 */
export const RelativeUrl = v.pipe(
	v.string(),
	v.transform((value) => {
		// Convert relative url to URL object
		// @note removes ../../ parts
		try {
			return new URL(value, 'http://localhost');

			// eslint-disable-next-line no-unused-vars
		} catch (e) {
			return null;
		}
	}),
	v.custom((urlOrNull) => {
		return urlOrNull ? true : false;
	}, 'Invalid URL pathname or search part'),
	v.transform((url) => {
		return (
			`${url.pathname}` +
			`${url.search.length <= 1 ? '' : url.search}` +
			`${url.hash.length <= 1 ? '' : url.hash}`
		);
	})
);

/**
 * Schema to validate an absolute or relative url
 *
 * @note an empty string is not allowed!
 */
export const AbsOrRelUrl = v.union([
	v.pipe(v.string(), v.trim(), v.url()),
	v.pipe(v.string(), v.nonEmpty(), RelativeUrl)
]);
