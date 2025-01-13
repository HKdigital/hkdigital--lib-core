import { CONTENT_TYPE, CONTENT_LENGTH } from '$lib/constants/http/index.js';

import { AUDIO_WAV } from '$lib/constants/mime/audio.js';

// import MockWav from './tiny-silence.wav?raw';

const BASE64_WAV =
	'UklGRnwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Create a response value that can be used by a mocked
 * fetch function
 *
 * @returns {Response}
 */
export function createWavResponse(/* data , options */) {
	// @note encode as Uint8Array to get the proper byte size of data
	// const bytes = new TextEncoder().encode(MockWav);

	const binaryString = atob(BASE64_WAV);
	const bytes = new Uint8Array(binaryString.length);

	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	const response = new Response(bytes, {
		headers: new Headers({
			[CONTENT_TYPE]: AUDIO_WAV,
			[CONTENT_LENGTH]: String(bytes.length)
		})
	});

	return response;
}
