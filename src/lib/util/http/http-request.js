import { METHOD_GET, METHOD_POST } from '$lib/constants/http/methods.js';

import { APPLICATION_JSON } from '$lib/constants/mime/application.js';
import { CONTENT_TYPE, CONTENT_LENGTH } from '$lib/constants/http/headers.js';

import { AbortError, TimeoutError } from '$lib/constants/errors/api.js';

import * as expect from '$lib/util/expect/index.js';

import { toURL } from './url.js';
import { setRequestHeaders } from './headers.js';
import { waitForAndCheckResponse } from './response.js';

/**
 * @callback requestHandler
 * @param {AbortController} controller
 * @param {( reason?: Error ) => void} abort
 * @param {( delayMs: number) => void} timeout
 */

/**
 * Make GET request
 *
 * @paramm {object} _
 *
 * @param {string|URL} _.url - Url string or URL object
 *
 * @param {object} [_.urlSearchParams]
 *   Parameters that should be added to the request url
 *
 * @param {object} [_.headers]
 *   Object that contains custom headers. A header is a name, value pair.
 *
 *   e.g. options.headers = { "content-type": "application/json" }
 *
 * @param {requestHandler} [_.requestHandler]
 *
 * @param {number} [_.timeoutMs]
 *   If defined, this request will abort after the specified number of
 *   milliseconds. Values above the the built-in request timeout won't work.
 *
 * @returns {Promise<*>} responsePromise
 */
export async function httpGet({ url, urlSearchParams, headers, requestHandler, timeoutMs }) {
	const responsePromise = httpRequest({
		method: METHOD_GET,
		url,
		urlSearchParams,
		headers,
		requestHandler,
		timeoutMs
	});

	return await waitForAndCheckResponse(responsePromise, url);
}

/**
 * Make POST request
 *
 * @paramm {object} _
 *
 * @param {string|URL} _.url - Url string or URL object
 *
 * @param {any} [_.body] - POST data
 *
 * @param {object} [_.headers]
 *   Object that contains custom headers. A header is a name, value pair.
 *
 *   e.g. options.headers = { "content-type": "application/json" }
 *
 * @param {requestHandler} [_.requestHandler]
 *
 * @param {number} [_.timeoutMs]
 *   If defined, this request will abort after the specified number of
 *   milliseconds. Values above the the built-in request timeout won't work.
 *
 * @returns {Promise<*>} responsePromise
 */
export async function httpPost({ url, body = null, headers, requestHandler, timeoutMs }) {
	const responsePromise = httpRequest({
		method: METHOD_POST,
		url,
		body,
		headers,
		requestHandler,
		timeoutMs
	});

	return await waitForAndCheckResponse(responsePromise, url);
}

// -----------------------------------------------------------------------------

/**
 * Make an HTTP request
 * - This is a low level function, consider using
 *   httpGet, httpPost, jsonGet or jsonPost instead
 *
 * @paramm {object} _
 *
 * @param {string|URL} _.url - Url string or URL object
 *
 * @param {string} _.method - Request method: METHOD_GET | METHOD_POST
 *
 * @param {object} [_.urlSearchParams] - URL search parameters as key-value pairs
 *
 * @param {any} [_.body] - POST data
 *
 * @param {object} [_.headers]
 *   Object that contains custom headers. A header is a name, value pair.
 *
 *   e.g. options.headers = { "content-type": "application/json" }
 *
 * @param {requestHandler} [_.requestHandler]
 *
 * @param {number} [_.timeoutMs]
 *   If defined, this request will abort after the specified number of
 *   milliseconds. Values above the the built-in request timeout won't work.
 *
 * @throws TypeError - If a network error occurred
 *
 * @note Check the `ok` property of the resolved response to check if the
 *       response was successfull (e.g. in case of a 404, ok is false)
 *
 * @returns {Promise<Response>} responsePromise
 */
export async function httpRequest({
	method,
	url,
	urlSearchParams = null,
	body = null,
	headers,
	requestHandler,
	timeoutMs
}) {
	url = toURL(url);

	// @see https://developer.mozilla.org/en-US/docs/Web/API/Headers

	const requestHeaders = new Headers();

	if (headers) {
		setRequestHeaders(requestHeaders, headers);

		if (headers[CONTENT_TYPE] === APPLICATION_JSON && typeof body !== 'string') {
			throw new Error(
				`Trying to send request with [content-type:${APPLICATION_JSON}], ` +
					'but body is not a (JSON encoded) string.'
			);
		}
		// IDEA: try to decode the body to catch errors on client side
	}

	const init = {
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'omit',
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		headers: requestHeaders
	};

	// Allow search params also for other request types than GET

	if (urlSearchParams) {
		if (!(urlSearchParams instanceof URLSearchParams)) {
			throw new Error(
				'Invalid parameter [urlSearchParams] ' + '(expected instanceof URLSearchParams)'
			);
		}

		const existingParams = url.searchParams;

		for (const [name, value] of urlSearchParams.entries()) {
			if (existingParams.has(name)) {
				throw new Error(
					`Cannot set URL search parameter [${name}] ` + `in url [${url.href}] (already set)`
				);
			}

			existingParams.set(name, value);
		} // end for
	}

	//
	// Sort search params to make the url nicer
	//
	url.searchParams.sort();

	// console.log( "url", url );

	init.method = method;

	if (METHOD_POST === method) {
		init.body = body || null; /* : JSON.stringify( body ) */
	}

	// @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request

	// console.log( "init", init );
	// console.log( "headers", init.headers );

	const request = new Request(url, init);

	// @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort

	const controller = new AbortController();
	const signal = controller.signal;

	//
	// A fetch() promise will reject with a TypeError when a network error
	// is encountered or CORS is misconfigured on the server-side,
	// although this usually means permission issues or similar
	// — a 404 does not constitute a network error, for example.
	// An accurate check for a successful fetch() would include checking
	// that the promise resolved, then checking that the Response.ok property
	// has a value of true. The code would look something like this:
	//
	// fetch()
	// .then( () => {
	//   if( !response.ok ) {
	//     throw new Error('Network response was not OK');
	//   }
	//   ...
	// }
	// .catch((error) => { .. }
	//

	const promise = fetch(request, { signal });

	if (requestHandler || timeoutMs) {
		const abort = (/** @type {Error?} */ reason) => {
			if (!reason) {
				reason = new AbortError(`Request [${url.href}] aborted`);
			}

			controller.abort(reason);
		};

		/**
		 * Function that can be used to set a timeout on a request
		 *
		 * @param {number} delayMs
		 */
		const timeout = (delayMs = 10000) => {
			expect.positiveNumber(delayMs, 'Invalid value for [delayMs]');

			const timerId = setTimeout(() => {
				controller.abort(new TimeoutError(`Request [${url.href}] timed out [${delayMs}]`));
			}, delayMs);

			promise.finally(() => {
				clearTimeout(timerId);
			});
		};

		if (timeoutMs) {
			timeout(timeoutMs);
		}

		if (requestHandler) {
			expect.function(requestHandler, 'Invalid parameter [requestHandler]');

			requestHandler({ controller, abort, timeout });
		}
	}

	// response promise
	return promise;
}
