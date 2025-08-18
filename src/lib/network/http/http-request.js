import {
  METHOD_GET,
  METHOD_POST,
  METHOD_PUT,
  METHOD_DELETE,
  METHOD_PATCH,
  METHOD_OPTIONS,
  METHOD_HEAD
} from '$lib/constants/http/methods.js';

import { APPLICATION_JSON } from '$lib/constants/mime/application.js';
import { CONTENT_TYPE } from '$lib/constants/http/headers.js';

import { AbortError, TimeoutError } from '../errors/api.js';

import * as expect from '$lib/util/expect.js';

import { toURL } from './url.js';
import { setRequestHeaders } from './headers.js';
import { waitForAndCheckResponse } from './response.js';

import { getCachedResponse, storeResponseInCache } from './caching.js';

import { isTestEnv } from '$lib/util/env';

/**
 * Default configuration for HTTP requests
 *
 * This object contains default settings used by the HTTP request functions.
 * It can be used as a reference for available options and their default values.
 *
 * @type {Object}
 */
export const DEFAULT_HTTP_CONFIG = {
  // Request
  method: METHOD_GET,
  urlSearchParams: null,
  body: null,
  headers: null,
  withCredentials: false,
  timeoutMs: null, // No timeout by default

  // Fetch
  mode: 'cors',
  cache: 'no-cache',
  redirect: 'follow',
  referrerPolicy: 'no-referrer',

  // Cache
  cacheEnabled: true
};

/**
 * Make a GET request
 *
 * This function performs an HTTP GET request with optional parameters,
 * headers, credentials, and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Basic GET request
 * const response = await httpGet({
 *   url: 'https://api.example.com/data'
 * });
 *
 * @example
 * // GET request with URL parameters and timeout
 * const response = await httpGet({
 *   url: 'https://api.example.com/search',
 *   urlSearchParams: new URLSearchParams({ q: 'search term' }),
 *   timeoutMs: 5000
 * });
 *
 * @example
 * // GET request with abort capability
 * const response = await httpGet({
 *   url: 'https://api.example.com/large-data',
 *   requestHandler: ({ abort }) => {
 *     // Store abort function for later use
 *     window.abortDataRequest = abort;
 *   }
 * });
 */
export async function httpGet(options) {
  return await httpRequest({
    ...options,
    method: METHOD_GET
  });
}

/**
 * Make a POST request
 *
 * This function performs an HTTP POST request with optional body,
 * headers, credentials, and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Basic POST request with JSON data
 * const response = await httpPost({
 *   url: 'https://api.example.com/users',
 *   body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
 *   headers: { 'content-type': 'application/json' }
 * });
 *
 * @example
 * // POST request with timeout
 * const response = await httpPost({
 *   url: 'https://api.example.com/upload',
 *   body: formData,
 *   timeoutMs: 30000 // 30 seconds timeout
 * });
 */
export async function httpPost(options) {
  return await httpRequest({
    ...options,
    method: METHOD_POST
  });
}

/**
 * Make a PUT request
 *
 * This function performs an HTTP PUT request, typically used for updating
 * or replacing resources. It supports optional body, headers, credentials,
 * and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Update a user resource
 * const response = await httpPut({
 *   url: 'https://api.example.com/users/123',
 *   body: JSON.stringify({ name: 'John Doe', email: 'john.doe@example.com' }),
 *   headers: { 'content-type': 'application/json' }
 * });
 *
 * @example
 * // Replace a resource with timeout
 * const response = await httpPut({
 *   url: 'https://api.example.com/documents/456',
 *   body: documentData,
 *   timeoutMs: 10000 // 10 seconds timeout
 * });
 */
export async function httpPut(options) {
  return await httpRequest({
    ...options,
    method: METHOD_PUT
  });
}

/**
 * Make a DELETE request
 *
 * This function performs an HTTP DELETE request, typically used for
 * removing resources. It supports optional headers, credentials,
 * and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Delete a user resource
 * const response = await httpDelete({
 *   url: 'https://api.example.com/users/123'
 * });
 *
 * @example
 * // Delete with authorization and timeout
 * const response = await httpDelete({
 *   url: 'https://api.example.com/posts/456',
 *   headers: { 'authorization': 'Bearer token123' },
 *   timeoutMs: 5000
 * });
 */
export async function httpDelete(options) {
  return await httpRequest({
    ...options,
    method: METHOD_DELETE
  });
}

/**
 * Make a PATCH request
 *
 * This function performs an HTTP PATCH request, typically used for
 * partial updates to resources. It supports optional body, headers,
 * credentials, and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Partially update a user's email
 * const response = await httpPatch({
 *   url: 'https://api.example.com/users/123',
 *   body: JSON.stringify({ email: 'newemail@example.com' }),
 *   headers: { 'content-type': 'application/json' }
 * });
 *
 * @example
 * // Apply JSON Patch operations
 * const response = await httpPatch({
 *   url: 'https://api.example.com/documents/456',
 *   body: JSON.stringify([
 *     { op: 'replace', path: '/title', value: 'New Title' },
 *     { op: 'add', path: '/tags/-', value: 'updated' }
 *   ]),
 *   headers: { 'content-type': 'application/json-patch+json' }
 * });
 */
export async function httpPatch(options) {
  return await httpRequest({
    ...options,
    method: METHOD_PATCH
  });
}

/**
 * Make an OPTIONS request
 *
 * This function performs an HTTP OPTIONS request, typically used for
 * discovering allowed methods on a resource or for CORS preflight requests.
 * It supports optional headers, credentials, and timeout functionality.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Check allowed methods on a resource
 * const response = await httpOptions({
 *   url: 'https://api.example.com/users/123'
 * });
 *
 * const allowedMethods = response.headers.get('Allow');
 * console.log('Allowed methods:', allowedMethods);
 *
 * @example
 * // CORS preflight check
 * const response = await httpOptions({
 *   url: 'https://api.example.com/data',
 *   headers: {
 *     'Access-Control-Request-Method': 'POST',
 *     'Access-Control-Request-Headers': 'Content-Type'
 *   }
 * });
 */
export async function httpOptions(options) {
  return await httpRequest({
    ...options,
    method: METHOD_OPTIONS
  });
}

/**
 * Make a HEAD request
 *
 * This function performs an HTTP HEAD request, which returns only the
 * headers of a response without the body. It's useful for checking
 * resource existence, getting metadata, or cache validation.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @returns {Promise<Response>} Response promise (with empty body)
 *
 * @example
 * // Check if a resource exists
 * const response = await httpHead({
 *   url: 'https://api.example.com/users/123'
 * });
 *
 * if (response.ok) {
 *   console.log('User exists');
 *   console.log('Last modified:', response.headers.get('Last-Modified'));
 * }
 *
 * @example
 * // Get content length without downloading
 * const response = await httpHead({
 *   url: 'https://api.example.com/large-file.zip'
 * });
 *
 * const contentLength = response.headers.get('Content-Length');
 * console.log('File size:', contentLength, 'bytes');
 *
 * @example
 * // Cache validation
 * const response = await httpHead({
 *   url: 'https://api.example.com/data',
 *   headers: { 'If-None-Match': '"cached-etag-value"' }
 * });
 *
 * if (response.status === 304) {
 *   console.log('Cache is still valid');
 * }
 */
export async function httpHead(options) {
  return await httpRequest({
    ...options,
    method: METHOD_HEAD
  });
}

// -----------------------------------------------------------------------------

/**
 * Make an HTTP request (low-level function)
 *
 * This is a low-level function that powers httpGet and httpPost.
 * It provides complete control over request configuration.
 *
 * @param {import('./typedef').HttpRequestOptions} options
 *   Request configuration options
 *
 * @throws {TypeError} If a network error occurred
 * @returns {Promise<Response>} Response promise
 *
 * @example
 * // Custom HTTP request with PUT method
 * const response = await httpRequest({
 *   method: 'PUT',
 *   url: 'https://api.example.com/resources/123',
 *   body: JSON.stringify({ status: 'updated' }),
 *   headers: { 'content-type': 'application/json' },
 *   withCredentials: true
 * });
 *
 * // Check if response was successful
 * if (response.ok) {
 *   // Process response
 * } else {
 *   // Handle error based on status
 * }
 */
export async function httpRequest(options) {
  // Apply default configuration
  const config = { ...DEFAULT_HTTP_CONFIG, ...options };

  const {
    method,
    url: rawUrl,
    urlSearchParams,
    body,
    headers,
    withCredentials,
    requestHandler,
    timeoutMs,
    mode,
    cache,
    redirect,
    referrerPolicy,
    cacheEnabled
  } = config;

  const url = toURL(rawUrl);

  // console.debug(`http:load [${url.pathname}]`);

  // Only consider caching for GET requests
  const shouldAttemptCache = cacheEnabled && method === METHOD_GET;

  // Try to get from cache if appropriate
  if (shouldAttemptCache && cache !== 'no-store' && cache !== 'reload') {
    const cacheKeyParams = { url, ...headers };
    const cachedResponse = await getCachedResponse(cacheKeyParams);

    if (!isTestEnv) {
      if (cachedResponse) {
        console.debug(`http:cache-hit [${url.pathname}]`);
        return cachedResponse;
      } else {
        console.debug(`http:cache-miss [${url.pathname}]`);
      }
    }
  }

  // @see https://developer.mozilla.org/en-US/docs/Web/API/Headers
  const requestHeaders = new Headers();

  if (headers) {
    setRequestHeaders(requestHeaders, headers);

    if (
      headers[CONTENT_TYPE] === APPLICATION_JSON &&
      typeof body !== 'string'
    ) {
      throw new Error(
        `Trying to send request with [content-type:${APPLICATION_JSON}], ` +
          'but body is not a (JSON encoded) string.'
      );
    }
    // IDEA: try to decode the body to catch errors on client side
  }

  /** @type {RequestInit} */
  const init = {
    mode,
    cache,
    credentials: withCredentials ? 'include' : 'omit',
    redirect,
    referrerPolicy,
    headers: requestHeaders
  };

  // Allow search params also for other request types than GET
  if (urlSearchParams) {
    if (!(urlSearchParams instanceof URLSearchParams)) {
      throw new Error(
        'Invalid parameter [urlSearchParams] ' +
          '(expected instanceof URLSearchParams)'
      );
    }

    const existingParams = url.searchParams;

    for (const [name, value] of urlSearchParams.entries()) {
      if (existingParams.has(name)) {
        throw new Error(
          `Cannot set URL search parameter [${name}] ` +
            `in url [${url.href}] (already set)`
        );
      }

      existingParams.set(name, value);
    } // end for
  }

  //
  // Sort search params to make the url nicer
  //
  url.searchParams.sort();

  init.method = method;

  if (METHOD_POST === method) {
    init.body = body || null; /* : JSON.stringify( body ) */
  }

  // @see https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
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
    /**
     * @type {(reason?: any) => void}
     */
    const abort = (reason) => {
      if (!reason) {
        reason = new AbortError(`Request [${url.href}] aborted`);
      }

      controller.abort(reason);
    };

    /**
     * Function that can be used to set a timeout on a request
     *
     * @param {number} delayMs - Milliseconds to wait before timeout
     */
    const timeout = (delayMs = 10000) => {
      expect.positiveNumber(delayMs);

      const timerId = setTimeout(() => {
        controller.abort(
          new TimeoutError(`Request [${url.href}] timed out [${delayMs}]`)
        );
      }, delayMs);

      promise.finally(() => {
        clearTimeout(timerId);
      });
    };

    if (timeoutMs) {
      timeout(timeoutMs);
    }

    if (requestHandler) {
      expect.function(requestHandler);

      requestHandler({ controller, abort, timeout });
    }
  }

  // Wait for the response and check it
  const response = await waitForAndCheckResponse(promise, url);

  // If caching is enabled, store the response in cache
  if (shouldAttemptCache && response.ok) {
    // Extract cache control headers
    const cacheControl = response.headers.get('Cache-Control') || '';
    const etag = response.headers.get('ETag');
    const lastModified = response.headers.get('Last-Modified');

    // Parse cache-control directives
    const directives = {};
    cacheControl.split(',').forEach((directive) => {
      const [key, value] = directive.trim().split('=');
      directives[key.toLowerCase()] = value !== undefined ? value : true;
    });

    // Determine if cacheable
    const isCacheable = !directives['no-store'] && !directives['private'];

    if (isCacheable) {
      // Calculate expiration time
      let expires = null;
      if (directives['max-age']) {
        const maxAge = parseInt(directives['max-age'], 10);
        expires = Date.now() + maxAge * 1000;
      } else if (response.headers.get('Expires')) {
        expires = new Date(response.headers.get('Expires')).getTime();
      }

      // Create stale info
      // const staleInfo = {
      //   isStale: false,
      //   fresh: null,
      //   timestamp: Date.now(),
      //   expires
      // };

      // Store response in cache
      const cacheKeyParams = { url, ...headers };
      await storeResponseInCache(cacheKeyParams, response.clone(), {
        etag,
        lastModified,
        expires,
        immutable: directives['immutable'] || false
      });
    }
  }

  return response;
}
