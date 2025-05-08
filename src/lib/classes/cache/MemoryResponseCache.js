/**
 * @fileoverview In-memory implementation of response cache.
 *
 * This implementation provides a simple in-memory cache for HTTP responses
 * with the same API as IndexedDbCache. It's useful for tests and environments
 * where persistent storage isn't needed or available.
 *
 * @example
 * // Create a memory cache
 * const cache = new MemoryResponseCache();
 *
 * // Store a response
 * const response = await fetch('https://example.com/api/data');
 * await cache.set('api-data', response, { expiresIn: 3600000 });
 *
 * // Retrieve a cached response
 * const cached = await cache.get('api-data');
 * if (cached) {
 *   console.log(cached.response);
 * }
 */

/**
 * @typedef {Object} CacheEntry
 * @property {Response} response - Cached Response object
 * @property {Object} metadata - Cache entry metadata
 * @property {string} url - Original URL
 * @property {number} timestamp - When the entry was cached
 * @property {number|null} expires - Expiration timestamp (null if no expiration)
 * @property {string|null} etag - ETag header if present
 * @property {string|null} lastModified - Last-Modified header if present
 */

/**
 * In-memory response cache implementation
 */
export default class MemoryResponseCache {
  /**
   * Create a new in-memory cache
   */
  constructor() {
    /**
     * Internal cache storage using Map
     * @type {Map<string, Object>}
     */
    this.cache = new Map();
  }

  /**
   * Get a cached response
   *
   * @param {string} key - Cache key
   * @returns {Promise<CacheEntry|null>} Cache entry or null if not found/expired
   */
  async get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expires && Date.now() > entry.expires) {
      this.delete(key);
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();

    return {
      response: entry.response.clone(),
      metadata: entry.metadata,
      url: entry.url,
      timestamp: entry.timestamp,
      expires: entry.expires,
      etag: entry.etag,
      lastModified: entry.lastModified
    };
  }

  /**
   * Store a response in the cache
   *
   * @param {string} key - Cache key
   * @param {Response} response - Response to cache
   * @param {Object} [metadata={}] - Cache metadata
   * @returns {Promise<void>}
   */
  async set(key, response, metadata = {}) {
    const now = Date.now();

    // Calculate expiration time if expiresIn is provided
    let expires = metadata.expires || null;
    if (!expires && metadata.expiresIn) {
      expires = now + metadata.expiresIn;
    }

    this.cache.set(key, {
      response: response.clone(),
      metadata,
      url: response.url,
      timestamp: now,
      lastAccessed: now,
      expires,
      etag: response.headers.get('ETag'),
      lastModified: response.headers.get('Last-Modified')
    });
  }

  /**
   * Delete a cached entry
   *
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} True if entry was deleted
   */
  async delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached responses
   *
   * @returns {Promise<void>}
   */
  async clear() {
    this.cache.clear();
  }

  /**
   * Close the cache (no-op for memory cache, for API compatibility)
   *
   * @returns {Promise<void>}
   */
  async close() {
    // No-op for memory cache
  }
}
