import { CONTENT_TYPE, CONTENT_LENGTH } from '$lib/constants/http.js';

import { OCTET_STREAM } from '$lib/constants/mime.js';

/**
 * Create a response value that can be used by a mocked fetch function
 *
 * @template T
 *
 * @param {T} data
 *
 * @returns {{ json: () => Promise<T>}}
 */
export function createJsonFetchResponse(data /* , options */) {
	return { json: () => new Promise((resolve) => resolve(data)) };
}

/**
 * Create a response value that can be used by a mocked fetch function
 *
 * @param {ArrayBuffer} arrayBuffer
 *
 * @returns {Response}
 */
export function createStreamedResponse(arrayBuffer /*, options */) {
	const byteLength = arrayBuffer.byteLength;
	const chunkSize = Math.ceil(byteLength / 10);

	const body = new ReadableStream({
		start(controller) {
			let offset = 0;

			function pushChunk() {
				if (offset >= byteLength) {
					controller.close();
					return;
				}

				// Calculate the size of the current chunk
				const currentChunkSize = Math.min(chunkSize, byteLength - offset);

				// Create a new ArrayBuffer for this chunk
				const chunk = arrayBuffer.slice(offset, offset + currentChunkSize);

				controller.enqueue(chunk);
				offset += currentChunkSize;

				// Schedule next chunk
				setTimeout(pushChunk, 0);
			}

			// Start pushing chunks
			pushChunk();
		}
	});

	const response = new Response(body, {
		headers: new Headers({
			[CONTENT_TYPE]: OCTET_STREAM,
			[CONTENT_LENGTH]: String(byteLength)
		})
	});

	return response;
}
