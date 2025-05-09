
/**
 * @typedef {Object} CacheEntry
 * @property {Response} response - Cached Response object
 * @property {Object} metadata - Cache entry metadata
 * @property {string} url - Original URL
 * @property {number} timestamp - When the entry was cached
 * @property {number|null} expires - Expiration timestamp (null if no expiration)
 * @property {string|null} etag - ETag header if present
 * @property {string|null} lastModified - Last-Modified header if present
 * @property {string|null} cacheVersion
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

// > IndexedDB

/**
 * @typedef {Object} IDBRequestEvent
 * @property {IDBRequest} target - The request that generated the event
 */

/**
 * @typedef {Object} IDBVersionChangeEvent
 * @property {IDBOpenDBRequest} target - The request that generated the event
 * @property {IDBTransaction} [target.transaction] - The transaction for database upgrade
 */

// > Export default

export default {};
