import { ResponseError } from '$lib/constants/errors/index.js';
import * as expect from '$lib/util/expect/index.js';

import { WWW_AUTHENTICATE } from '$lib/constants/http/headers.js';

import { toURL } from './url.js';

import { getErrorFromResponse } from './errors.js';

/**
 * Check if the response status is ok
 *
 * @param {object} response
 * @param {string} url - used to produce useful error messages
 *
 * @throws {Error} not found
 * @throws {Error} internal server error
 */
export async function expectResponseOk(response, url) {
	expect.object(response);

	url = toURL(url);

	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201

	if (200 === response.status || 201 === response.status) {
		if (!response.ok) {
			throw new ResponseError(
				`Server returned - ${response.status} ${response.statusText} ` +
					`[response.ok=false] [url=${decodeURI(url.href)}]`
			);
		}

		// All ok
		return;
	}

	// > Handle 401 Unauthorized

	if (401 === response.status) {
		let errorMessage = 'Server returned [401] Unauthorized';

		const authValue = response.headers.get(WWW_AUTHENTICATE);

		if (authValue) {
			// Add WWW_AUTHENTICATE response to error message

			errorMessage += ` (${authValue})`;
		}

		errorMessage += ` [url=${decodeURI(url.href)}]`;

		throw new Error(errorMessage);
	}

	// > Handle all other error responses

	const error = await getErrorFromResponse(response);

	throw new ResponseError(
		`Server returned - ${response.status} ${response.statusText} ` + `[url=${decodeURI(url.href)}]`,
		{ cause: error }
	);
}
