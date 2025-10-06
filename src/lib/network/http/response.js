import { ResponseError, HttpError } from '$lib/network/errors.js';
import * as expect from '$lib/util/expect.js';
import { toURL } from './url.js';

import {
  WWW_AUTHENTICATE,
  CONTENT_LENGTH
} from '$lib/constants/http/headers.js';

import { href } from './url.js';

import { getErrorFromResponse } from './errors.js';

// > Types

/**
 * Callback function that reports progress of data loading
 *
 * @callback progressCallback
 *
 * @param {object} _
 * @param {number} _.bytesLoaded - Number of bytes loaded so far
 * @param {number} _.size - Total size of the response in bytes (0 if unknown)
 */

// > Exports

/**
 * Check if the response status is ok (in 200-299 range)
 * This function examines HTTP status codes and throws appropriate errors for
 * non-successful responses, with special handling for 401 Unauthorized.
 *
 * @param {object} response - Fetch Response object to check
 *
 * @param {string} url - The URL used for the request (for error messages)
 *
 * @throws {Error} When response has 401 status with authorization details
 * @throws {ResponseError} When response has other non-successful status codes
 *
 * @example
 * // Check if response was successful
 * try {
 *   await expectResponseOk(response, 'https://api.example.com/data');
 *   // Process successful response here
 * } catch (error) {
 *   // Handle specific error types
 *   if (error.message.includes('401')) {
 *     // Handle unauthorized error
 *   }
 * }
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
    null,
    error
  );
}

/**
 * Get the response size from the content-length response header
 *
 * @param {Response} response - Fetch Response object
 *
 * @returns {number} Response size in bytes, or 0 if content-length is not set
 *
 * @example
 * const response = await fetch('https://example.com/large-file.zip');
 * const size = getResponseSize(response);
 * console.log(`Download size: ${size} bytes`);
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
 * This function awaits a response promise and performs error checking,
 * wrapping network errors in a standardized ResponseError format.
 *
 * @param {Promise<Response>} responsePromise - Promise that resolves to a Response
 *
 * @param {string|URL} url - URL used for the request (for error messages)
 *
 * @throws {ResponseError} When a network error occurs or response is not ok
 *
 * @returns {Promise<Response>} The response if successful
 *
 * @example
 * // Handle a fetch promise with proper error handling
 * const responsePromise = fetch('https://api.example.com/data');
 * try {
 *   const response = await waitForAndCheckResponse(
 *     responsePromise,
 *     'https://api.example.com/data'
 *   );
 *   // Process response
 * } catch (error) {
 *   // Handle standardized ResponseError
 *   console.error(error.message);
 * }
 */
export async function waitForAndCheckResponse(responsePromise, url) {
  expect.promise(responsePromise);

  url = toURL(url);

  let response;

  try {
    response = await responsePromise;

    if (response && false === response.ok) {
      // Check if this is a network error (status 0) vs HTTP error
      if (response.status === 0) {
        // Network error - treat as before
        throw new Error(`Response failed [response.ok=false]`);
      }
      
      // HTTP error - get response body for detailed error information
      const responseBody = await response.text();
      let errorDetails;

      try {
        // Try to parse as JSON (common for API errors)
        errorDetails = JSON.parse(responseBody);
      } catch {
        // Fallback to plain text
        errorDetails = responseBody;
      }

      throw new HttpError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`,
        errorDetails
      );
    }
  } catch (e) {
    if (e instanceof HttpError) {
      // Re-throw HttpError as-is
      throw e;
    } else if (e instanceof TypeError || response?.ok === false) {
      throw new ResponseError(
        `A network error occurred for request [${href(url)}]`,
        null,
        e
      );
    } else {
      throw e;
    }
  }

  return response;
}

/**
 * Load response body as ArrayBuffer with progress monitoring and abort capability
 *
 * This function reads a response body stream chunk by chunk, with optional
 * progress reporting. It provides an abort mechanism to cancel an in-progress
 * download.
 *
 * @param {Response} response - Fetch Response object to read
 *
 * @param {progressCallback} [onProgress] - Optional callback for progress updates
 *
 * @returns {{
 *   bufferPromise: Promise<ArrayBuffer>,
 *   abort: () => void
 * }} Object containing the buffer promise and abort function
 *
 * @example
 * // Download a file with progress monitoring and abort capability
 * const response = await fetch('https://example.com/large-file.zip');
 *
 * const { bufferPromise, abort } = loadResponseBuffer(
 *   response,
 *   ({ bytesLoaded, size }) => {
 *     // Update progress UI
 *     const percent = size ? Math.round((bytesLoaded / size) * 100) : 0;
 *     console.log(`Downloaded ${bytesLoaded} bytes (${percent}%)`);
 *   }
 * );
 *
 * // To abort the download:
 * // abort();
 *
 * try {
 *   const buffer = await bufferPromise;
 *   // Process the complete buffer
 * } catch (error) {
 *   console.error('Download failed or was aborted', error);
 * }
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

  let reader;
  let aborted = false;

  /**
   * Read chunks from response body using reader
   *
   * @returns {Promise<ArrayBuffer>}
   */
  async function read() {
    reader = response.body.getReader();
    let chunks = [];

    for (;;) {
      const { done, value } = await reader.read();

      if (value) {
        // @note value is an ArrayBuffer
        bytesLoaded += value.byteLength;

        chunks.push(value);

        if (onProgress /*&& size*/) {
          onProgress({ bytesLoaded, size });
        }
      }

      if (done || aborted) {
        // Loading complete or aborted by user
        break;
      }
    } // end for

    if (size && bytesLoaded !== size) {
      console.error(`Received [${bytesLoaded}], but expected [${size}] bytes`);
    }

    // Concat the chunks into a single array
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

      if (reader) {
        reader.cancel('Aborted by user');
      }
    }
  };
} // end fn
