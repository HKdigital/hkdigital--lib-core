import { METHOD_GET, METHOD_POST } from '$lib/constants/http/methods.js';

import { APPLICATION_JSON } from '$lib/constants/mime/application.js';
import { CONTENT_TYPE } from '$lib/constants/http/headers.js';
import { ResponseError } from '$lib/constants/errors/index.js';

import * as expect from '$lib/util/expect/index.js';

import { toURL } from './url.js';
import { httpRequest } from './http-request.js';
import { waitForAndCheckResponse } from './response.js';

const ACCEPT = 'accept';

/**
 * Make a GET request to fetch JSON encoded data
 * - Expect JSON response from server
 *
 * @param {string|URL} url - Url string or URL object
 *
 * @param {object} [urlSearchParams]
 *   Parameters that should be added to the request url
 *
 * @param {array[]} [headers]
 *   List of custom headers. Each header is an array that contains
 *   the header name and the header value.
 *   E.g. [ "content-type", "application/json" ]
 *
 * @throws ResponseError
 *   If a network error occurred or the response was not ok
 *
 * @returns {any} parsed JSON data
 */
export async function jsonGet({ url, urlSearchParams, headers }) {
	url = toURL(url);

	if (!headers) {
		headers = {};
	}

	headers[ACCEPT] = APPLICATION_JSON;

	const responsePromise = httpRequest({
		method: METHOD_GET,
		url,
		urlSearchParams,
		headers
	});

	const response = await waitForAndCheckResponse(responsePromise, url);

	let parsedResponse;

	try {
		//
		// @note when security on the client side fails, an `opaque` response
		//       is returned by the browser (empty body) -> parsing fails
		//       (use CORS to fix this)
		//
		parsedResponse = await response.json();
	} catch (e) {
		throw new ResponseError(`Failed to JSON decode server response from [${decodeURI(url.href)}]`, {
			cause: e
		});
	}

	if (parsedResponse.error) {
		throw new ResponseError(`Server returned response error message [${parsedResponse.error}]`);
	}

	return parsedResponse;
}

/**
 * Make a POST request to fetch JSON encoded data
 * - Expect JSON response from server
 *
 * @param {string|URL} url - Url string or URL object
 *
 * @param {any} body
 *   Data that will be converted to a JSON encoded string and send to the server
 *
 * @param {object} [urlSearchParams]
 *   Parameters that should be added to the request url.
 *
 *   @note
 *   Be careful when using urlSearchParams in POST requests, it can be
 *   confusing since the parameters usually go in the body part of the request.
 *
 * @param {array[]} [headers]
 *   List of custom headers. Each header is an array that contains
 *   the header name and the header value.
 *   E.g. [ "content-type", "application/json" ]
 *
 * @throws ResponseError
 *   If a network error occurred or the response was not ok
 *
 * @returns {any} parsed JSON data
 */
export async function jsonPost({ url, body, urlSearchParams, headers }) {
	url = toURL(url);

	if (!headers) {
		headers = {};
	} else {
		expect.object(headers);
	}

	expect.defined(body);

	headers[ACCEPT] = APPLICATION_JSON;
	headers[CONTENT_TYPE] = APPLICATION_JSON;

	const responsePromise = httpRequest({ METHOD_POST, url, body, urlSearchParams, headers });

	const response = await waitForAndCheckResponse(responsePromise, url);

	let parsedResponse;

	try {
		//
		// @note when security on the client side fails, an `opaque` response
		//       is returned by the browser (empty body) -> parsing fails
		//       (use CORS to fix this)
		//
		parsedResponse = await response.json();
	} catch (e) {
		// console.log( response );
		throw new ResponseError(`Failed to JSON decode server response from [${decodeURI(url.href)}]`);
	}

	if (parsedResponse.error) {
		//
		// @note this is API specific, but it's quite logical
		//
		//
		throw new ResponseError(`Server returned response error message [${parsedResponse.error}]`);
	}

	return parsedResponse;
}
