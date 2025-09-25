/**
 * @typedef {Object} HttpRequestOptions
 * @property {string|URL} url URL string or URL object for the request
 * @property {string} [method] HTTP method to use (GET, POST, etc.)
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {*} [body] Request body (for POST, PUT, etc.)
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {Function} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.)
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} RequestHandlerParams
 *
 * @property {AbortController} controller
 *   The AbortController instance for this request
 *
 * @property {(reason?: Error) => void} abort Function to abort the request
 * @property {(delayMs: number) => void} timeout Function to set a timeout
 */

/**
 * @callback RequestHandler
 * @param {RequestHandlerParams} params Parameters for controlling the request
 * @returns {void}
 */

/**
 * @typedef {Object} JsonGetOptions
 * @property {string|URL} url URL string or URL object for the request
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {RequestHandler} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.)
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} JsonPostOptions
 * @property {string|URL} url URL string or URL object for the request
 * @property {*} body Request body (will be sent as JSON)
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {RequestHandler} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.)
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} JsonPutOptions
 * @property {string|URL} url URL string or URL object for the request
 * @property {*} body Request body (will be sent as JSON)
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {RequestHandler} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.)
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} JsonPatchOptions
 * @property {string|URL} url URL string or URL object for the request
 * @property {*} body Request body (will be sent as JSON)
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {RequestHandler} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.)
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} JsonDeleteOptions
 * @property {string|URL} url URL string or URL object for the request
 *
 * @property {Object|URLSearchParams} [urlSearchParams]
 *   Parameters to add to the URL
 *
 * @property {Record<string, string>} [headers] HTTP headers as name-value pairs
 * @property {boolean} [withCredentials] Whether to include credentials
 * @property {number} [timeoutMs] Request timeout in milliseconds
 * @property {RequestHandler} [requestHandler] Handler for abort/timeout control
 * @property {string} [mode] CORS mode ('cors', 'no-cors', 'same-origin')
 * @property {string} [cache] Cache mode ('default', 'no-cache', etc.')
 * @property {string} [redirect] Redirect mode ('follow', 'error', 'manual')
 * @property {string} [referrerPolicy] Referrer policy
 * @property {boolean} [cacheEnabled] Enable or disabled automatic caching
 */

/**
 * @typedef {Object} StaleInfo
 * @property {boolean} isStale Whether the response contains stale data
 *
 * @property {Promise<Response>|null} fresh
 *   Promise that resolves to fresh data (if available)
 *
 * @property {number} timestamp When the response was originally cached
 * @property {number|null} expires When the response expires
 */

/**
 * @typedef {Response} ResponseWithStale
 * @property {boolean} isStale Whether this response contains stale data
 *
 * @property {Promise<Response>|null} fresh
 *   Promise for fresh data if this is stale
 */

export {};
