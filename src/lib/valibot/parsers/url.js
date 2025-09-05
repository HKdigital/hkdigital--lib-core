// > Imports

import * as v from 'valibot';

import { URL_SLUG } from '$lib/constants/regexp/index.js';

// > URL Parsers

/**
 * Parser for URL or empty string.
 */
export const UrlOrEmptyString = v.pipe(
	v.pipe(v.string(), v.trim()),
	v.union([v.literal(''), v.pipe(v.string(), v.url())])
);

/**
 * Parser for URL that may miss the protocol part
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
 * Parser for URL path, without a search and hash part
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
		// @ts-ignore
		return url.pathname;
	})
);

/**
 * Parser for URL path, which consists of
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
			// @ts-ignore
			`${url.pathname}` +
			// @ts-ignore
			`${url.search.length <= 1 ? '' : url.search}` +
			// @ts-ignore
			`${url.hash.length <= 1 ? '' : url.hash}`
		);
	})
);

/**
 * Parser for absolute or relative URL
 *
 * @note an empty string is not allowed!
 */
export const AbsOrRelUrl = v.union([
	v.pipe(v.string(), v.trim(), v.url()),
	v.pipe(v.string(), v.nonEmpty(), RelativeUrl)
]);

/**
 * Parser for URL slug (e.g., "my-blog-post", "user-123")
 *
 * @note Must start and end with Latin characters or numbers
 * @note Hyphens are allowed between character groups
 * @note Automatically converts to lowercase
 */
export const Slug = v.pipe(
	v.string(),
	v.trim(),
	v.toLowerCase(),
	v.regex(new RegExp(URL_SLUG, 'v'), 'Must be a valid URL slug')
);
