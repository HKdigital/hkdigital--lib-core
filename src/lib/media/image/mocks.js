import { CONTENT_TYPE, CONTENT_LENGTH } from '$lib/constants/http/index.js';

import { IMAGE_PNG } from '$lib/constants/mime/image.js';

/**
 * A minimal 1x1 black PNG encoded as base64
 * @constant {string}
 */
const BASE64_PNG =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

/**
 * Create a response value that can be used by a mocked
 * fetch function
 *
 * @returns {Response}
 */
export function createPngResponse(/* data , options */) {
  // Convert base64 to binary
  const binaryString = atob(BASE64_PNG);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const response = new Response(bytes, {
    headers: new Headers({
      [CONTENT_TYPE]: IMAGE_PNG,
      [CONTENT_LENGTH]: String(bytes.length)
    })
  });

  return response;
}
