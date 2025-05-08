import {
  MemoryResponseCache,
  IndexedDbCache
} from '$lib/classes/cache';

import { browser } from '$app/environment';

import { isTestEnv } from '$lib/util/env';

let defaultCacheStorage = null;

function getCacheStorage()
{
  if( !defaultCacheStorage )
  {
    let type;

    if( !browser || isTestEnv )
    {
      type = 'memory';
    }
    else {
      type = 'indexed-db';
    }

    defaultCacheStorage = createCacheStorage( type);
  }

  return defaultCacheStorage
}

/**
 * Store a response in the cache
 *
 * @param {object} cacheKeyParams - Parameters to use for cache key generation
 * @param {string|URL} cacheKeyParams.url - URL string or URL object
 * @param {object} [cacheKeyParams.headers] - Request headers that affect caching
 * @param {Response} response - Response to cache
 * @param {object} metadata - Cache metadata
 * @returns {Promise<void>}
 */
export async function storeResponseInCache(cacheKeyParams, response, metadata) {
  try {
    const { url: rawUrl, ...headers } = cacheKeyParams;
    const url = typeof rawUrl === 'string' ? rawUrl : rawUrl.toString();

    // Generate cache key
    const cacheKey = generateCacheKey(url, headers);

    // Extract Vary header info
    const varyHeader = response.headers.get('Vary');
    let varyHeaders = null;

    if (varyHeader) {
      varyHeaders = {};
      const varyFields = varyHeader.split(',').map(field => field.trim().toLowerCase());

      // Store hashes of headers mentioned in Vary
      for (const field of varyFields) {
        if (field !== '*') {
          const value = headers[field];
          varyHeaders[field] = hashValue(value);
        }
      }
    }

    // Add vary headers to metadata
    const enhancedMetadata = {
      ...metadata,
      varyHeaders
    };

    // Store in cache
    await getCacheStorage().set(cacheKey, response, enhancedMetadata);
  } catch (error) {
    console.error('Cache storage error:', error);
  }
}

/**
 * Get a cached response if available and valid
 *
 * @param {object} cacheKeyParams - Parameters to use for cache key generation
 * @param {string|URL} cacheKeyParams.url - URL string or URL object
 * @param {object} [cacheKeyParams.headers] - Request headers that affect caching
 *
 * @returns {Promise<Response|import('./typedef').ResponseWithStale|null>}
 *   Cached response or null
 */
export async function getCachedResponse(cacheKeyParams) {
  try {
    const { url: rawUrl, ...headers } = cacheKeyParams;
    const url = typeof rawUrl === 'string' ? rawUrl : rawUrl.toString();

    // Generate cache key
    const cacheKey = generateCacheKey(url, headers);

    // Get cached entry
    const cachedEntry = await getCacheStorage().get(cacheKey);

    if (!cachedEntry) {
      return null;
    }

    // Validate based on Vary headers
    if (!isValidForVaryHeaders(cachedEntry, headers)) {
      return null;
    }

    const { response, metadata } = cachedEntry;

    // Check if expired
    const isExpired = metadata.expires && Date.now() > metadata.expires;

    if (!isExpired) {
      // Not expired, return as-is
      return response;
    }

    // Response is stale, add stale info
    return enhanceResponseWithStale(response, {
      isStale: true,
      fresh: null,  // No fresh data available yet
      timestamp: metadata.timestamp,
      expires: metadata.expires
    });
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

// > Internal functions

/**
 * Create a cache storage adapter
 * @param {string} type Type of storage ('indexed-db', 'memory')
 * @param {Object} options Options for the storage adapter
 *
 * @returns {import('$lib/classes/cache').CacheStorage}
 */
function createCacheStorage(type = 'indexed-db', options = {}) {
  switch (type) {
    case 'indexed-db':
      return new IndexedDbCache(
        {
          dbName: 'http-cache',
          storeName: 'responses'
        } );

    case 'memory':
      return new MemoryResponseCache();

    default:
      throw new Error(`Unsupported cache storage type: ${type}`);
  }
}

/**
 * Check if cached entry is valid based on Vary headers
 *
 * @param {object} cachedEntry - Cached entry with response and metadata
 * @param {object} headers - Current request headers
 * @returns {boolean} True if valid for these headers
 */
function isValidForVaryHeaders(cachedEntry, headers) {
  const { metadata } = cachedEntry;

  // If no vary headers stored, consider valid
  if (!metadata.varyHeaders) {
    return true;
  }

  // Check each stored vary header
  for (const [name, storedHash] of Object.entries(metadata.varyHeaders)) {
    const currentValue = headers[name];
    const currentHash = hashValue(currentValue);

    // Compare hashes
    if (currentHash !== storedHash) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a cache key based on URL and relevant headers
 *
 * @param {string} url - URL string
 * @param {object} headers - Request headers
 * @returns {string} Cache key
 */
function generateCacheKey(url, headers) {
  // Start with a hash of the URL
  const keyParts = [hashValue(url)];

  // If we have headers
  if (headers && Object.keys(headers).length > 0) {
    // Get all header names, sorted for consistency
    const headerNames = Object.keys(headers).sort();

    // Create a hash for each header value
    const headerHashes = headerNames.map(name => {
      const value = headers[name];
      // Format: "name:hash_of_value"
      return `${name}:${hashValue(value)}`;
    });

    if (headerHashes.length > 0) {
      keyParts.push(headerHashes.join('|'));
    }
  }

  return keyParts.join('::');
}

/**
 * Create a hash of a value
 *
 * @param {string} value - Value to hash
 * @returns {string} Hash representation
 */
function hashValue(value) {
  if (!value) return '';

  // Convert to string if not already
  const stringValue = String(value);

  // Simple non-cryptographic hash function
  let hash = 0;
  for (let i = 0; i < stringValue.length; i++) {
    const char = stringValue.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16); // Convert to hex
}


/**
 * Enhance a Response object with stale data properties
 *
 * @param {Response} response - The original Response object
 * @param {import('./typedef').StaleInfo} staleInfo - Stale data information
 *
 * @returns {import('./typedef').ResponseWithStale}
 *   Enhanced response with stale data properties
 */
function enhanceResponseWithStale(response, staleInfo) {
  // Create a new object that inherits from Response prototype
  const enhanced = Object.create(
    Object.getPrototypeOf(response),
    Object.getOwnPropertyDescriptors(response)
  );

  // Add stale properties
  enhanced.isStale = staleInfo.isStale || false;
  enhanced.fresh = staleInfo.fresh || null;

  return enhanced;
}
