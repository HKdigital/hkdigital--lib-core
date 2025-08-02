import * as expect from '$lib/util/expect/index.js';

import { CONTENT_TYPE } from '$lib/constants/http/index.js';

import { APPLICATION_JSON } from '$lib/constants/mime/index.js';

/**
 * Try to get error information from the server error response
 *
 * This method tries to get error info from JSON responses. The
 * error info may be set as one of the following properties
 *
 * - message
 * - error
 * - messages (array)
 * - errors (array)
 *
 * Otherwise tris method will use the plain text response
 *
 * @param {object} response
 *
 * @returns {Error} error
 */
export async function getErrorFromResponse(response) {
	expect.object(response);

	let message;
	let details = null;

	const headers = response.headers;
	const contentType = headers.get(CONTENT_TYPE);

	let content;

	if (contentType === APPLICATION_JSON) {
		content = await response.json();

		if (content instanceof Object) {
			if (typeof content.message === 'string') {
				// Use string propery 'message' as error message
				message = content.message;
			} else if (typeof content.error === 'string') {
				// Use string propery 'error' as error message
				message = content.error;
			} else {
				if (Array.isArray(content.errors)) {
					// Use array propery 'errors' for error messages

					details = content.errors;
				} else if (Array.isArray(content.messages)) {
					// Use array propery 'messages' for error messages

					details = content.messages;
				}

				if (details) {
					// Multiple error messages (array) =>
					//   create string respresentation by combining
					//   text parts from all error messages
					const tmp = [];

					for (const current of details) {
						if (typeof current === 'string') {
							// Error is a string
							tmp.push(current);
						} else if (current instanceof Object && typeof current.message === 'string') {
							// Error is an object with string property 'message'
							tmp.push(current.message);
						} else {
							// JSON stringify everything else
							tmp.push(JSON.stringify(current));
						}
					} // end for

					message = tmp.join(', ');
				}
			}
		}
	} else {
		const tmp = await response.text();

		if (tmp.length) {
			message = tmp;
		} else {
			message = response.statusText;
		}
	}
	// console.log( "message", message );

	const error = new Error(message);

	if (details) {
		error.details = details;
	}

	return error;
}
