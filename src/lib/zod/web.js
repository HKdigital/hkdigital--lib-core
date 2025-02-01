// > Imports

import { z } from 'zod';

// > Exports

/**
 * Parse Url
 * - Allows relative urls (only the pathname and a search part of an url)
 * - Require the use of the HTTP(s) protocol in absolute URL's
 *
 * @param {object} _
 * @param {boolean} [_.allowRelative=true]
 * @param {boolean} [_.requireHttp=true]
 *
 * @returns {{ parse:function }}
 */
export function UrlOrPath({ allowRelative = true, requireHttp = true } = {}) {
	// > URL parser
	return z.string().refine((value) => {
		let url;

		try {
			if (!allowRelative) {
				// > Ensure that URL is absolute
				url = new URL(value);

				if (requireHttp) {
					// > Ensure that protocol is http(s)
					if (url.protocol.startsWith('http')) {
						return null;
					}
				}

				return `${url.origin}${url.pathname}` + `${url.search.length <= 1 ? '' : url.search}`;
			} else {
				// > Parse relative URL
				// @note removes ../../ parts

				url = new URL(value, 'http://localhost');

				return `${url.pathname}` + `${url.search.length <= 1 ? '' : url.search}`;
			}
			// eslint-disable-next-line no-unused-vars
		} catch (e) {
			return null;
		}
	});
}

export const AbsOrRelUrl = UrlOrPath();
/** @typedef {string} AbsOrRelUrl */
