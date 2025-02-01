// > Imports

import * as v from 'valibot';
// import { UrlOrEmptyString } from '$lib/valibot/url.js';

const ValidateTrim = v.custom((value) => {
	if (/^\s|\s$/.test(value)) {
		throw new Error('Should not start or end with whitespace');
	}
	return true;
});

// > Exports

/**
 * Schema to validate an URL
 */
export const ValidateUrl = v.pipe(v.string(), v.url(), ValidateTrim);

/**
 * Schema to validate an URL or empty string.
 */
export const ValidateUrlOrEmptyString = v.union([v.literal(''), v.pipe(v.string(), v.url())]);

// export const ValidateHumanUrl

/**
 * Schema to validate an URL path
 */
export const ValidateUrlPath = v.pipe(
	v.string(),
	ValidateTrim,
	v.transform((value) => {
		return {
			url: new URL(value, 'http://localhost'),
			value
		};
	}),
	v.custom(({ url }) => {
		if (url.search) {
			return false;
		}
		return true;
	}, 'Value should not contain search path'),
	v.custom(({ url }) => {
		if (url.hash) {
			return false;
		}
		return true;
	}, 'Value should not contain hash path'),
	v.transform(({ url }) => {
		return url.pathname;
	})
);

/**
 * Schema to validate a relative URL
 */
export const ValidateRelativeUrl = v.pipe(
	v.string(),
	ValidateTrim,
	v.custom((value) => {
		try {
			return new URL(value, 'http://localhost');

			// eslint-disable-next-line no-unused-vars
		} catch (e) {
			throw new Error('Invalid relative URL');
		}
	})
);

export const ValidateAbsOrRelUrl = v.pipe(
	v.string(),
	ValidateTrim,
	v.custom((value) => {
		try {
			if (/^https?:\/\//.test(value)) {
				// Absolute url using protocol http(s)
				return new URL(value);
			} else {
				// Relative URL
				return new URL(value, 'http://localhost');
			}

			// eslint-disable-next-line no-unused-vars
		} catch (e) {
			throw new Error('Invalid relative URL');
		}
	})
);

/**
 * Schema to validate an url that may miss the protocol part
 *
 * @note an empty string is not allowed!
 */
// export const HumanUrl = v.pipe(
//   v.custom( ( value ) => {
//       if( value.includes('://') )
//       {
//         v.parse( Url, value );
//         return true;
//       }
//     } )
//   );

// 	// v.transform((value) => {
// 	// 	if (!value.length || value.includes('://')) {
// 	// 		return value;
// 	// 	} else {
// 	// 		// Prefix 'url' with 'https://'
// 	// 		return `https://${value}`;
// 	// 	}
// 	// }),
// 	// v.url()
// );

/**
 * Schema to validate url path, without a search and hash part
 */
// export const UrlPath = v.pipe(
// 	v.string(),
// 	v.transform((value) => {
// 		// Convert relative url to URL object
// 		// @note removes ../../ parts
// 		try {
// 			return new URL(value, 'http://localhost');

// 			// eslint-disable-next-line no-unused-vars
// 		} catch (e) {
// 			return null;
// 		}
// 	}),
// 	v.custom((urlOrNull) => {
// 		return urlOrNull ? true : false;
// 	}, 'Invalid URL pathname'),
// 	v.transform((url) => {
// 		return url.pathname;
// 	})
// );

/**
 * Schema to validate a url path, which consists of
 * a path and optionally search and hash parts
 */
// export const RelativeUrl = v.pipe(
// 	v.string(),
// 	v.transform((value) => {
// 		// Convert relative url to URL object
// 		// @note removes ../../ parts
// 		try {
// 			return new URL(value, 'http://localhost');

// 			// eslint-disable-next-line no-unused-vars
// 		} catch (e) {
// 			return null;
// 		}
// 	}),
// 	v.custom((urlOrNull) => {
// 		return urlOrNull ? true : false;
// 	}, 'Invalid URL pathname or search part'),
// 	v.transform((url) => {
// 		return (
// 			`${url.pathname}` +
// 			`${url.search.length <= 1 ? '' : url.search}` +
// 			`${url.hash.length <= 1 ? '' : url.hash}`
// 		);
// 	})
// );

/**
 * Schema to validate an absolute or relative url
 *
 * @note an empty string is not allowed!
 */
// export const AbsOrRelUrl = v.union([
// 	v.pipe(v.string(), v.trim(), v.url()),
// 	v.pipe(v.string(), v.nonEmpty(), RelativeUrl)
// ]);
