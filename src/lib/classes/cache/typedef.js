
/**
 * @typedef {Object} CacheEntry
 * @property {Response} response The cached response
 * @property {Object} metadata Cache metadata including expiration
 * @property {string} url The request URL
 * @property {number} timestamp When the entry was cached
 * @property {number|null} expires When the entry expires
 * @property {string|null} etag ETag for conditional requests
 * @property {string|null} lastModified Last-Modified for conditional requests
 */

/**
 * @typedef {Object} CacheStorage
 * @property {function(string): Promise<CacheEntry|null>} get
 *   Get a cached response for a key
 * @property {function(string, Response, Object): Promise<void>} set
 *   Store a response in the cache
 * @property {function(string): Promise<boolean>} delete
 *   Remove a cached response
 * @property {function(): Promise<void>} clear
 *   Clear all cached responses
 */

export default {};
