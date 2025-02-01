import { CONTENT_TYPE, CONTENT_LENGTH } from '$lib/constants/http/index.js';

import { OCTET_STREAM } from '$lib/constants/mime/application.js';

const BASE64_DATA =
  'UklGRnwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

/**
 * Create a response value that can be used by a mocked
 * fetch function
 *
 * @returns {Response}
 */
export function createDataResponse(/* data , options */) {
  const binaryString = atob(BASE64_DATA);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const response = new Response(bytes, {
    headers: new Headers({
      [CONTENT_TYPE]: OCTET_STREAM,
      [CONTENT_LENGTH]: String(bytes.length)
    })
  });

  return response;
}
