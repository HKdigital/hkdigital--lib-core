import { ResponseError } from '$lib/constants/errors/index.js';
import * as expect from '$lib/util/expect/index.js';
import { toURL } from '$lib/util/http/url.js';

import {
	WWW_AUTHENTICATE,
	CONTENT_LENGTH
} from '$lib/constants/http/headers.js';

import { href } from './url.js';

import { getErrorFromResponse } from './errors.js';

// > Types

/**
 * @callback progressCallback
 * @param {object} _
 * @param {number} _.bytesLoaded
 * @param {number} _.size
 */

// > Exports

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

	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201

	if (200 === response.status || 201 === response.status) {
		if (!response.ok) {
			throw new ResponseError(
				`Server returned - ${response.status} ${response.statusText} ` +
					`[response.ok=false] [url=${href(url)}]`
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

		errorMessage += ` [url=${href(url)}]`;

		throw new Error(errorMessage);
	}

	// > Handle all other error responses

	const error = await getErrorFromResponse(response);

	throw new ResponseError(
		`Server returned - ${response.status} ${response.statusText} ` +
			`[url=${href(url)}]`,
		{ cause: error }
	);
}

/**
 * Get the response size from the content-length response header
 *
 * @param {Response} response
 *
 * @returns {number} response size or 0 if unknown
 */
export function getResponseSize(response) {
	const sizeStr = response.headers.get(CONTENT_LENGTH);

	if (!sizeStr) {
		return 0;
	}

	return parseInt(sizeStr, 10);
}

/**
 * Wait for a response and check if the response is ok
 *
 * @example
 *   const response = await waitForAndCheckResponse( responsePromise );
 *
 * @param {Promise<Response>} responsePromise
 * @param {string|URL} url - An url that is used for error messages
 *
 * @throws ResponseError - A response error if something went wrong
 *
 * @returns {Promise<Response>} response
 */
export async function waitForAndCheckResponse(responsePromise, url) {
	expect.promise(responsePromise);

	url = toURL(url);

	let response;

	try {
		response = await responsePromise;

		if (response && false === response.ok) {
			// if response.ok is false, it also indicates a network error
			throw new Error(`Response failed [response.ok=false]`);
		}
	} catch (e) {
		if (e instanceof TypeError || response?.ok === false) {
			throw new ResponseError(
				`A network error occurred for request [${href(url)}]`,
				{
					cause: e
				}
			);
		} else {
			throw e;
		}
	}

	return response;
}

/**
 * Load response body as ArrayBuffer
 * - Progress can be monitored by suppying an onProgress callback
 * - Loading can be aborted by calling the returned abort function
 *
 * @param {Response} response - Fetch response
 * @param {progressCallback} onProgress
 *
 * @returns {{ bufferPromise: Promise<ArrayBuffer>, abort: () => void }}
 */
export function loadResponseBuffer(response, onProgress) {
	// @note size might be 0
	// @note might not be send by server in dev mode
	const size = getResponseSize(response);

	let bytesLoaded = 0;

	if (onProgress /*&& size*/) {
		onProgress({ bytesLoaded, size });
	}

	if (!response.body) {
		throw new Error('Missing [response.body]');
	}

	const reader = response.body.getReader();

	let aborted = false;

	/**
	 * Read chunks from response body using reader
	 *
	 * @returns {Promise<ArrayBuffer>}
	 */
	async function read() {
		let chunks = [];

		// - Use flag 'loading'
		// - Check if #abortLoading still exists
		for (;;) {
			const { done, value } = await reader.read();

			if (value) {
				// @note value is an ArrayBuffer
				bytesLoaded += value.byteLength;

				// console.log({ done, value, byteLength: value.byteLength, bytesLoaded });

				// console.log({ size, bytesLoaded, value });

				if (size && bytesLoaded > size) {
					throw new Error(
						`Received more bytes [${bytesLoaded}] than specified by header content-length [${size}]`
					);
				}

				chunks.push(value);

				if (onProgress /*&& size*/) {
					onProgress({ bytesLoaded, size });
				}
			}

			if (done || aborted) {
				// Loading complete or aborted by user
				break;
			}
		} // end while

		if (size && bytesLoaded !== size) {
			throw new Error(
				`Received [${bytesLoaded}], but expected [${size}] bytes`
			);
		}

		// Concat the chinks into a single array
		let buffer = new ArrayBuffer(bytesLoaded);
		let body = new Uint8Array(buffer);

		let offset = 0;

		// Place the chunks in the buffer
		for (let chunk of chunks) {
			body.set(chunk, offset);
			offset += chunk.byteLength;
		} // end for

		return buffer;
	}

	const bufferPromise = read();

	return {
		bufferPromise,
		abort: () => {
			aborted = true;
		}
	};
} // end fn
