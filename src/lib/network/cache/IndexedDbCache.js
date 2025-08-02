/**
 * @fileoverview IndexedDbCache provides efficient persistent caching with
 * automatic, non-blocking background cleanup.
 *
 * This cache automatically manages storage limits and entry expiration
 * in the background using requestIdleCallback to avoid impacting application
 * performance. It supports incremental cleanup, storage monitoring, and
 * graceful degradation on older browsers.
 *
 * @example
 * // Create a cache instance
 * const cache = new IndexedDbCache({
 *   dbName: 'app-cache',
 *   storeName: 'http-responses',
 *   maxSize: 100 * 1024 * 1024, // 100MB
 *   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
 *   cacheVersion: '1.0.0' // For cache invalidation
 * });
 *
 * // Store a response
 * const response = await fetch('https://api.example.com/data');
 * await cache.set('api-data', response, {
 *   expiresIn: 3600000 // 1 hour
 * });
 *
 * // Retrieve cached response
 * const cached = await cache.get('api-data');
 * if (cached) {
 *   console.log('Cache hit', cached.response);
 * } else {
 *   console.log('Cache miss');
 * }
 */

/** @typedef {import('./typedef').CacheEntry} CacheEntry */

/** @typedef {import('./typedef').IDBRequestEvent} IDBRequestEvent */

/** @typedef {import('./typedef').IDBVersionChangeEvent} IDBVersionChangeEvent */

const DEFAULT_DB_NAME = 'http-cache';
const DEFAULT_STORE_NAME = 'responses';
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const DEFAULT_MAX_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days

const DEFAULT_CLEANUP_BATCH_SIZE = 100;
const DEFAULT_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes;

const DEFAULT_CLEANUP_POSTPONE_MS = 5000; // 5 seconds

/**
 * IndexedDbCache with automatic background cleanup
 */
export default class IndexedDbCache {
  /**
   * Create a new IndexedDB cache storage
   *
   * @param {Object} [options] - Cache options
   * @param {string} [options.dbName='http-cache'] - Database name
   * @param {string} [options.storeName='responses'] - Store name
   * @param {number} [options.maxSize=50000000] - Max cache size in bytes (50MB)
   * @param {number} [options.maxAge=604800000] - Max age in ms (7 days)
   * @param {number} [options.cleanupBatchSize=100] - Items per cleanup batch
   * @param {number} [options.cleanupInterval=300000] - Time between cleanup attempts (5min)
   * @param {number} [options.cleanupPostponeTimeout=5000] - Time to postpone cleanup after store (5sec)
   * @param {string} [options.cacheVersion='1.0.0'] - Cache version, used for cache invalidation
   */
  constructor(options = {}) {
    this.dbName = options.dbName || DEFAULT_DB_NAME;
    this.storeName = options.storeName || DEFAULT_STORE_NAME;

    this.maxSize = options.maxSize || DEFAULT_MAX_SIZE;
    this.maxAge = options.maxAge || DEFAULT_MAX_AGE;

    this.cleanupBatchSize =
      options.cleanupBatchSize || DEFAULT_CLEANUP_BATCH_SIZE;
    this.cleanupInterval = options.cleanupInterval || DEFAULT_CLEANUP_INTERVAL;

    this.cleanupPostponeTimeout =
      options.cleanupPostponeTimeout || DEFAULT_CLEANUP_POSTPONE_MS;
    this.cacheVersion = options.cacheVersion || '1.0.0';

    // Define index names as constants to ensure consistency
    this.EXPIRES_INDEX = 'expires';
    this.TIMESTAMP_INDEX = 'timestamp';
    this.SIZE_INDEX = 'size';
    this.CACHE_VERSION_INDEX = 'cacheVersion';

    // Current schema version - CRITICAL: Increment this when schema changes
    this.SCHEMA_VERSION = 2;

    /**
     * Database connection promise
     * @type {Promise<IDBDatabase>}
     * @private
     */
    this.dbPromise = null;

    /**
     * Cleanup state tracker
     * @type {Object}
     * @private
     */
    this.cleanupState = {
      inProgress: false,
      lastRun: 0,
      totalRemoved: 0,
      nextScheduled: false,
      postponeUntil: 0
    };

    // Cleanup postponer timer handle
    this.postponeCleanupTimer = null;

    // Initialize the database and schedule cleanup only after it's ready
    this._initDatabase();
  }

  /**
   * Initialize the database connection
   *
   * @private
   */
  async _initDatabase() {
    try {
      this.dbPromise = this._openDatabase();
      await this.dbPromise; // Wait for connection to be established

      // Only schedule cleanup after database is ready
      this._scheduleCleanup();
    } catch (err) {
      console.error('Failed to initialize IndexedDB cache:', err);
    }
  }

  /**
   * Open the IndexedDB database with proper schema versioning
   *
   * @private
   * @returns {Promise<IDBDatabase>}
   */
  async _openDatabase() {
    return new Promise((resolve, reject) => {
      try {
        // Open with current schema version
        const request = indexedDB.open(this.dbName, this.SCHEMA_VERSION);

        request.onerror = (event) => {
          const target = /** @type {IDBRequest} */ (event.target);

          console.error('IndexedDB open error:', target.error);
          reject(target.error);
        };

        request.onsuccess = (event) => {
          const db = /** @type {IDBRequest} */ (event.target).result;

          // Listen for connection errors
          db.onerror = (event) => {
            console.error(
              'IndexedDB error:',
              /** @type {IDBRequest} */ (event.target).error
            );
          };

          resolve(db);
        };

        // This runs when database is created or version is upgraded
        request.onupgradeneeded = (event) => {
          // console.log(
          //   `Upgrading database schema to version ${this.SCHEMA_VERSION}`
          // );

          const target = /** @type {IDBRequest} */ (event.target);
          const db = target.result;

          // Create or update the object store
          let store;

          if (!db.objectStoreNames.contains(this.storeName)) {
            store = db.createObjectStore(this.storeName, { keyPath: 'key' });
            // console.log(`Created object store: ${this.storeName}`);
          } else {
            // Get existing store for updating
            const transaction = target.transaction;
            store = transaction.objectStore(this.storeName);
            // console.log(`Using existing object store: ${this.storeName}`);
          }

          // Add indexes if they don't exist
          this._ensureIndexExists(store, this.EXPIRES_INDEX, 'expires', {
            unique: false
          });
          this._ensureIndexExists(store, this.TIMESTAMP_INDEX, 'timestamp', {
            unique: false
          });
          this._ensureIndexExists(store, this.SIZE_INDEX, 'size', {
            unique: false
          });
          this._ensureIndexExists(
            store,
            this.CACHE_VERSION_INDEX,
            'cacheVersion',
            { unique: false }
          );
        };
      } catch (err) {
        console.error('Error opening IndexedDB:', err);
        reject(err);
      }
    });
  }

  /**
   * Ensure an index exists in a store, create if missing
   *
   * @private
   * @param {IDBObjectStore} store - The object store
   * @param {string} indexName - Name of the index
   * @param {string} keyPath - Key path for the index
   * @param {Object} options - Index options (e.g. unique)
   */
  _ensureIndexExists(store, indexName, keyPath, options) {
    if (!store.indexNames.contains(indexName)) {
      store.createIndex(indexName, keyPath, options);
      // console.log(`Created index: ${indexName}`);
    }
    // else {
    //   console.log(`Index already exists: ${indexName}`);
    // }
  }

  /**
   * Check if all required indexes exist in the database
   *
   * @private
   * @returns {Promise<boolean>}
   */
  async _validateSchema() {
    try {
      const db = await this.dbPromise;

      // Verify the object store exists
      if (!db.objectStoreNames.contains(this.storeName)) {
        console.error(`Object store ${this.storeName} does not exist`);
        return false;
      }

      // We need to start a transaction to access the store
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);

      // Check that all required indexes exist
      const requiredIndexes = [
        this.EXPIRES_INDEX,
        this.TIMESTAMP_INDEX,
        this.SIZE_INDEX,
        this.CACHE_VERSION_INDEX
      ];

      for (const indexName of requiredIndexes) {
        if (!store.indexNames.contains(indexName)) {
          console.error(`Required index ${indexName} does not exist`);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Error validating schema:', err);
      return false;
    }
  }

  /**
   * Postpone cleanup for the specified duration
   * Resets the postpone timer if called again before timeout
   *
   * @private
   */
  _postponeCleanup() {
    // Set the postpone timestamp
    this.cleanupState.postponeUntil = Date.now() + this.cleanupPostponeTimeout;

    // Clear any existing timer
    if (this.postponeCleanupTimer) {
      clearTimeout(this.postponeCleanupTimer);
    }

    // Set a new timer to reset the postpone flag
    this.postponeCleanupTimer = setTimeout(() => {
      // Only reset if another postpone hasn't happened
      if (Date.now() >= this.cleanupState.postponeUntil) {
        this.cleanupState.postponeUntil = 0;

        // Reschedule cleanup if it was waiting
        if (!this.cleanupState.inProgress && !this.cleanupState.nextScheduled) {
          this._scheduleCleanup();
        }
      }
    }, this.cleanupPostponeTimeout);
  }

  /**
   * Check if cleanup is postponed
   *
   * @private
   * @returns {boolean}
   */
  _isCleanupPostponed() {
    return Date.now() < this.cleanupState.postponeUntil;
  }

  /**
   * Get a cached response
   * Supports retrieving older cache versions and migrating them
   *
   * @param {string} key - Cache key
   * @returns {Promise<CacheEntry|null>} Cache entry or null if not found/expired
   */
  async get(key) {
    try {
      const db = await this.dbPromise;

      let resolve;
      let reject;

      let promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
      });

      try {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = async () => {
          const entry = request.result;

          if (!entry) {
            resolve(null);
            return;
          }

          // Skip old entries or corrupted blobs
          if (!entry.bodyType || entry.bodyType !== 'ab') {
            // Delete old/corrupted entry
            this._deleteEntry(key).catch(console.error);
            resolve(null);
            return;
          }

          // Clone Blob before reference becomes invalid
          let responseBody = entry.body;

          if (entry.bodyType === 'ab') {
            // Reconstruct Blob from ArrayBuffer
            responseBody = new Blob([entry.body], {
              type: entry.contentType || 'application/octet-stream'
            });
          }

          // Check if expired
          if (entry.expires && Date.now() > entry.expires) {
            // Delete expired entry (but don't block)
            this._deleteEntry(key).catch((err) => {
              console.error('Failed to delete expired entry:', err);
            });
            resolve(null);
            return;
          }

          // Update access timestamp
          await this._updateAccessTime(key).catch((err) => {
            console.error('Failed to update access time:', err);
          });

          // Check if from a different cache version
          if (entry.cacheVersion !== this.cacheVersion) {
            // console.log(
            //   `Migrating entry ${key} from version ${entry.cacheVersion} to ${this.cacheVersion}`
            // );

            // Clone the entry for migration
            const migratedEntry = {
              ...entry,
              cacheVersion: this.cacheVersion
            };

            // Store the migrated entry (don't block)
            this._updateEntry(migratedEntry).catch((err) => {
              console.error(
                'Failed to migrate entry to current cache version:',
                err
              );
            });
          }

          // Deserialize the response
          try {
            let responseHeaders = new Headers(entry.headers);

            // Create Response safely
            let response;
            try {
              response = new Response(responseBody, {
                status: entry.status,
                statusText: entry.statusText,
                headers: responseHeaders
              });
              // eslint-disable-next-line no-unused-vars
            } catch (err) {
              // Simplified mock response for test environments
              response = /** @type {Response} */ ({
                status: entry.status,
                statusText: entry.statusText,
                headers: responseHeaders,
                body: entry.body,
                url: entry.url,
                clone() {
                  return this;
                }
              });
            }

            resolve({
              response,
              metadata: entry.metadata,
              url: entry.url,
              timestamp: entry.timestamp,
              expires: entry.expires,
              etag: entry.etag,
              lastModified: entry.lastModified,
              cacheVersion: entry.cacheVersion
            });
          } catch (err) {
            console.error('Failed to deserialize cached response:', err);

            // Delete corrupted entry
            this._deleteEntry(key).catch(console.error);
            resolve(null);
          }
        };
      } catch (err) {
        console.error('Error in get transaction:', err);
        return null;
      }

      return promise;
    } catch (err) {
      console.error('Cache get error:', err);
      return null;
    }
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
    try {
      // Postpone cleanup when storing items
      this._postponeCleanup();
      const db = await this.dbPromise;

      // Clone the response to avoid consuming it
      const clonedResponse = response.clone();

      // Extract response data - handle both browser Response and test mocks
      let body;
      let bodyType = 'ab';  // Default is ArrayBuffer
      let contentType = '';

      try {
        contentType = clonedResponse.headers.get('content-type') || '';

        // Try standard Response.blob() first (browser environment)
        const blob = await clonedResponse.blob();

        // Convert to ArrayBuffer
        body = await blob.arrayBuffer();

      } catch (err) {
        // Fallback for test environment
        if (typeof clonedResponse.body === 'string') {
          const blob = new Blob([clonedResponse.body]);
          body = await blob.arrayBuffer();
        } else if (
          clonedResponse.body instanceof ArrayBuffer ||
          clonedResponse.body instanceof Uint8Array
        ) {
          // Already have array-like data
          body = clonedResponse.body instanceof ArrayBuffer ?
            clonedResponse.body :
            clonedResponse.body.buffer;
        } else {
          // Last resort - create empty ArrayBuffer
          body = new ArrayBuffer(0);
        }
      }

      // Extract headers
      let headers = [];
      try {
        headers = Array.from(clonedResponse.headers.entries());
      } catch (err) {
        // Handle the error case
        console.error('Failed to extract headers:', err);
        headers = [];
      }

      // Calculate rough size estimate
      const headerSize = JSON.stringify(headers).length * 2;
      const size = body.byteLength + headerSize + key.length * 2;

      const entry = {
        key,
        url: clonedResponse.url || '',
        status: clonedResponse.status || 200,
        statusText: clonedResponse.statusText || '',
        headers,
        body,
        bodyType,
        contentType,
        metadata,
        timestamp: Date.now(),
        lastAccessed: Date.now(),
        expires:
          metadata.expires ||
          (metadata.expiresIn ? Date.now() + metadata.expiresIn : null),
        etag: clonedResponse.headers?.get?.('ETag') || null,
        lastModified: clonedResponse.headers?.get?.('Last-Modified') || null,
        cacheVersion: this.cacheVersion, // Store current cache version
        size // Store estimated size for cleanup
      };

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.put(entry);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            resolve();

            // Check if we need cleanup after adding new entries
            // Don't await to avoid blocking
            this._checkAndScheduleCleanup();
          };
        } catch (err) {
          console.error('Error in set transaction:', err);
          reject(err);
        }
      });
    } catch (err) {
      console.error('Cache set error:', err);
      throw err;
    }
  }

  /**
   * Update an existing entry in the cache
   *
   * @private
   * @param {Object} entry - The entry to update
   * @returns {Promise<boolean>}
   */
  async _updateEntry(entry) {
    try {
      const db = await this.dbPromise;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.put(entry);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(true);
        } catch (err) {
          console.error('Error in update transaction:', err);
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Cache update error:', err);
      return false;
    }
  }

  /**
   * Update last accessed timestamp (without blocking)
   *
   * @private
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async _updateAccessTime(key) {
    try {
      const db = await this.dbPromise;

      return new Promise((resolve) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.get(key);

          request.onerror = () => resolve(); // Don't block on errors

          request.onsuccess = () => {
            const entry = request.result;
            if (!entry) return resolve();

            entry.lastAccessed = Date.now();

            const updateRequest = store.put(entry);
            updateRequest.onerror = () => resolve(); // Don't block
            updateRequest.onsuccess = () => resolve();
          };
        } catch (err) {
          console.error('Error in _updateAccessTime:', err);
          resolve(); // Don't block on errors
        }
      });
    } catch (err) {
      console.error('Failed to update access time:', err);
      // Don't rethrow to avoid blocking
    }
  }

  /**
   * Delete a cached entry
   *
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    return this._deleteEntry(key);
  }

  /**
   * Delete a cached entry (internal implementation)
   *
   * @private
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async _deleteEntry(key) {
    try {
      const db = await this.dbPromise;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.delete(key);

          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(true);
        } catch (err) {
          console.error('Error in delete transaction:', err);
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Cache delete error:', err);
      return false;
    }
  }

  /**
   * Clear all cached responses
   *
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const db = await this.dbPromise;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.clear();

          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            this.cleanupState.totalRemoved = 0;
            resolve();
          };
        } catch (err) {
          console.error('Error in clear transaction:', err);
          reject(err);
        }
      });
    } catch (err) {
      console.error('Cache clear error:', err);
      throw err;
    }
  }

  /**
   * Check storage usage and schedule cleanup if needed
   *
   * @private
   */
  async _checkAndScheduleCleanup() {
    // Skip if cleanup is postponed
    if (this._isCleanupPostponed()) {
      return;
    }

    // Avoid multiple concurrent checks
    if (this.cleanupState.inProgress || this.cleanupState.nextScheduled) {
      return;
    }

    // Only check periodically
    const now = Date.now();
    if (now - this.cleanupState.lastRun < this.cleanupInterval) {
      return;
    }

    // Use storage estimate API if available in browser environment
    if (
      typeof navigator !== 'undefined' &&
      navigator.storage &&
      typeof navigator.storage.estimate === 'function'
    ) {
      try {
        const estimate = await navigator.storage.estimate();
        const usageRatio = estimate.usage / estimate.quota;

        // If using more than 80% of quota, schedule urgent cleanup
        if (usageRatio > 0.8) {
          this._scheduleCleanup(true);
          return;
        }
      } catch (err) {
        // Fall back to regular scheduling if estimate fails
        console.warn('Storage estimate error:', err);
      }
    }

    // Schedule normal cleanup
    this._scheduleCleanup();
  }

  /**
   * Schedule a cleanup to run during idle time
   *
   * @private
   * @param {boolean} [urgent=false] - If true, clean up sooner
   */
  _scheduleCleanup(urgent = false) {
    // Skip if cleanup is postponed
    if (this._isCleanupPostponed()) {
      return;
    }

    if (this.cleanupState.nextScheduled) {
      return;
    }

    this.cleanupState.nextScheduled = true;

    // Check if we're in a browser environment with requestIdleCallback
    if (
      typeof window !== 'undefined' &&
      typeof window.requestIdleCallback === 'function'
    ) {
      window.requestIdleCallback(
        () => {
          this.cleanupState.nextScheduled = false;
          // Check again if postponed before actually running
          if (!this._isCleanupPostponed()) {
            this._performCleanupStep();
          }
        },
        { timeout: urgent ? 1000 : 10000 }
      );
    } else {
      // Fallback for Node.js or browsers without requestIdleCallback
      setTimeout(
        () => {
          this.cleanupState.nextScheduled = false;
          // Check again if postponed before actually running
          if (!this._isCleanupPostponed()) {
            this._performCleanupStep();
          }
        },
        urgent ? 100 : 1000
      );
    }
  }

  /**
   * Get a random expiration time between 30 minutes and 90 minutes
   *
   * @private
   * @returns {number} Expiration time in milliseconds
   */
  _getRandomExpiration() {
    // Base time: 60 minutes (3,600,000 ms)
    const baseTime = 3600000;

    // Random factor: +/- 30 minutes (1,800,000 ms)
    const randomFactor = Math.random() * 1800000 - 900000;

    return Date.now() + baseTime + randomFactor;
  }

  /**
   * Perform a single cleanup step
   *
   * @private
   */
  async _performCleanupStep() {
    // Skip if already in progress or postponed
    if (this.cleanupState.inProgress || this._isCleanupPostponed()) {
      return;
    }

    this.cleanupState.inProgress = true;

    try {
      // First, validate the database schema
      const schemaValid = await this._validateSchema();

      // If schema is invalid, skip cleanup
      if (!schemaValid) {
        console.warn('Skipping cleanup due to invalid schema');
        this.cleanupState.inProgress = false;
        return;
      }

      const now = Date.now();
      let removedCount = 0;

      // Step 1: Remove expired entries first
      try {
        const expiredRemoved = await this._removeExpiredEntries(
          this.cleanupBatchSize / 2
        );
        removedCount += expiredRemoved;

        // If we have a lot of expired entries, focus on those first
        if (expiredRemoved >= this.cleanupBatchSize / 2) {
          this.cleanupState.lastRun = now;
          this.cleanupState.totalRemoved += removedCount;
          this.cleanupState.inProgress = false;

          // Schedule next cleanup step immediately if not postponed
          if (!this._isCleanupPostponed()) {
            this._scheduleCleanup();
          }
          return;
        }
      } catch (err) {
        console.error('Error removing expired entries:', err);
        // Continue to try the next cleanup step
      }

      // Check again if cleanup has been postponed during the operation
      if (this._isCleanupPostponed()) {
        this.cleanupState.inProgress = false;
        return;
      }

      // Step 2: Mark entries from different cache versions for expiration
      try {
        const markedCount = await this._markOldCacheVersionsForExpiration(
          this.cleanupBatchSize / 4
        );

        // if (markedCount > 0) {
        //   console.log(
        //     `Marked ${markedCount} entries from different cache versions for expiration`
        //   );
        // }
      } catch (err) {
        console.error('Error marking old cache versions for expiration:', err);
      }

      // Step 3: Remove old entries if we're over size/age limits
      try {
        const remainingBatch = this.cleanupBatchSize - removedCount;
        if (remainingBatch > 0) {
          const oldRemoved = await this._removeOldEntries(remainingBatch);
          removedCount += oldRemoved;
        }
      } catch (err) {
        console.error('Error removing old entries:', err);
      }

      // Update cleanup state
      this.cleanupState.lastRun = now;
      this.cleanupState.totalRemoved += removedCount;

      // If we removed entries in this batch and not postponed, schedule another cleanup
      if (removedCount > 0 && !this._isCleanupPostponed()) {
        this._scheduleCleanup();
      } else if (!this._isCleanupPostponed()) {
        // Schedule a check later
        setTimeout(() => {
          this._checkAndScheduleCleanup();
        }, this.cleanupInterval);
      }
    } catch (err) {
      console.error('Cache cleanup error:', err);
    } finally {
      this.cleanupState.inProgress = false;
    }
  }

  /**
   * Remove expired entries
   *
   * @private
   * @param {number} limit - Maximum number of entries to remove
   * @returns {Promise<number>} Number of entries removed
   */
  async _removeExpiredEntries(limit) {
    try {
      const now = Date.now();
      const db = await this.dbPromise;
      let removed = 0;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);

          // Check if the index exists before using it
          if (!store.indexNames.contains(this.EXPIRES_INDEX)) {
            console.error(`Required index ${this.EXPIRES_INDEX} not found`);
            resolve(0);
            return;
          }

          const index = store.index(this.EXPIRES_INDEX);

          // Create range for all entries with expiration before now
          const range = IDBKeyRange.upperBound(now);

          // Skip non-expiring entries (null expiration)
          const request = index.openCursor(range);

          request.onerror = (event) => {
            console.error(
              'Cursor error in _removeExpiredEntries:',
              /** @type {IDBRequest} */ (event.target).error
            );
            reject(/** @type {IDBRequest} */ (event.target).error);
          };

          // Handle cursor results
          request.onsuccess = (event) => {
            const cursor = /** @type {IDBRequest} */ (event.target).result;

            if (!cursor || removed >= limit) {
              resolve(removed);
              return;
            }

            try {
              // Delete the expired entry
              const deleteRequest = cursor.delete();

              deleteRequest.onsuccess = () => {
                removed++;

                // Move to next entry
                try {
                  cursor.continue();
                } catch (err) {
                  console.error(
                    'Error continuing cursor in _removeExpiredEntries:',
                    err
                  );
                  resolve(removed);
                }
              };

              deleteRequest.onerror = (event) => {
                console.error(
                  'Delete error in _removeExpiredEntries:',
                  event.target.error
                );
                // Try to continue anyway
                try {
                  cursor.continue();
                } catch (err) {
                  console.error(
                    'Error continuing cursor after delete error:',
                    err
                  );
                  resolve(removed);
                }
              };
            } catch (err) {
              console.error(
                'Error deleting entry in _removeExpiredEntries:',
                err
              );
              resolve(removed);
            }
          };
        } catch (err) {
          console.error(
            'Error creating transaction in _removeExpiredEntries:',
            err
          );
          resolve(0);
        }
      });
    } catch (err) {
      console.error('_removeExpiredEntries error:', err);
      return 0;
    }
  }

  /**
   * Mark entries from old cache versions for gradual expiration
   *
   * @private
   * @param {number} limit - Maximum number of entries to mark
   * @returns {Promise<number>} Number of entries marked
   */
  async _markOldCacheVersionsForExpiration(limit) {
    try {
      const db = await this.dbPromise;
      let marked = 0;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);

          // Check if the index exists before using it
          if (!store.indexNames.contains(this.CACHE_VERSION_INDEX)) {
            console.error(
              `Required index ${this.CACHE_VERSION_INDEX} not found`
            );
            resolve(0);
            return;
          }

          // Get all entries not matching the current cache version
          const index = store.index(this.CACHE_VERSION_INDEX);

          // We need to use openCursor since we can't directly query for "not equals"
          const request = index.openCursor();

          request.onerror = (event) => {
            console.error(
              'Cursor error in _markOldCacheVersionsForExpiration:',
              /** @type {IDBRequest} */ (event.target).error
            );
            reject(/** @type {IDBRequest} */ (event.target).error);
          };

          request.onsuccess = (event) => {
            const cursor = /** @type {IDBRequest} */ (event.target).result;

            if (!cursor || marked >= limit) {
              resolve(marked);
              return;
            }

            try {
              const entry = cursor.value;

              // Only process entries from different cache versions
              if (entry.cacheVersion !== this.cacheVersion) {
                // Set a randomized expiration time if not already set
                if (
                  !entry.expires ||
                  entry.expires > this._getRandomExpiration()
                ) {
                  entry.expires = this._getRandomExpiration();

                  const updateRequest = cursor.update(entry);

                  updateRequest.onsuccess = () => {
                    marked++;

                    // Continue to next entry
                    try {
                      cursor.continue();
                    } catch (err) {
                      console.error(
                        'Error continuing cursor after update:',
                        err
                      );
                      resolve(marked);
                    }
                  };

                  updateRequest.onerror = (event) => {
                    console.error(
                      'Update error in _markOldCacheVersionsForExpiration:',
                      event.target.error
                    );
                    // Try to continue anyway
                    try {
                      cursor.continue();
                    } catch (err) {
                      console.error(
                        'Error continuing cursor after update error:',
                        err
                      );
                      resolve(marked);
                    }
                  };
                } else {
                  // Entry already has an expiration set, continue to next
                  try {
                    cursor.continue();
                  } catch (err) {
                    console.error(
                      'Error continuing cursor for entry with expiration:',
                      err
                    );
                    resolve(marked);
                  }
                }
              } else {
                // Skip entries from current cache version
                try {
                  cursor.continue();
                } catch (err) {
                  console.error(
                    'Error continuing cursor for current version entry:',
                    err
                  );
                  resolve(marked);
                }
              }
            } catch (err) {
              console.error(
                'Error processing entry in _markOldCacheVersionsForExpiration:',
                err
              );
              resolve(marked);
            }
          };
        } catch (err) {
          console.error(
            'Error creating transaction in _markOldCacheVersionsForExpiration:',
            err
          );
          resolve(0);
        }
      });
    } catch (err) {
      console.error('_markOldCacheVersionsForExpiration error:', err);
      return 0;
    }
  }

  /**
   * Remove old entries based on age and size constraints
   *
   * @private
   * @param {number} limit - Maximum number of entries to remove
   * @returns {Promise<number>} Number of entries removed
   */
  async _removeOldEntries(limit) {
    try {
      const db = await this.dbPromise;
      let removed = 0;

      // Get total cache size estimate (rough)
      const sizeEstimate = await this._getCacheSizeEstimate();

      // If we're under limits, don't remove anything
      if (sizeEstimate < this.maxSize) {
        return 0;
      }

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);

          // Check if the index exists before using it
          if (!store.indexNames.contains(this.TIMESTAMP_INDEX)) {
            console.error(`Required index ${this.TIMESTAMP_INDEX} not found`);
            resolve(0);
            return;
          }

          const index = store.index(this.TIMESTAMP_INDEX);
          const now = Date.now();

          // Start from the oldest entries
          const request = index.openCursor();

          request.onerror = (event) => {
            console.error(
              'Cursor error in _removeOldEntries:',
              /** @type {IDBRequest} */ (event.target).error
            );
            reject(/** @type {IDBRequest} */ (event.target).error);
          };

          // Process cursor results
          request.onsuccess = (event) => {
            const cursor = /** @type {IDBRequest} */ (event.target).result;

            if (!cursor || removed >= limit) {
              resolve(removed);
              return;
            }

            try {
              const entry = cursor.value;
              const age = now - entry.timestamp;

              // Delete if older than max age
              if (age > this.maxAge) {
                const deleteRequest = cursor.delete();

                deleteRequest.onsuccess = () => {
                  removed++;

                  // Move to next entry
                  try {
                    cursor.continue();
                  } catch (err) {
                    console.error(
                      'Error continuing cursor in _removeOldEntries:',
                      err
                    );
                    resolve(removed);
                  }
                };

                deleteRequest.onerror = (event) => {
                  console.error(
                    'Delete error in _removeOldEntries:',
                    event.target.error
                  );
                  // Try to continue anyway
                  try {
                    cursor.continue();
                  } catch (err) {
                    console.error(
                      'Error continuing cursor after delete error:',
                      err
                    );
                    resolve(removed);
                  }
                };
              } else {
                // Entry is not old enough, continue to next
                try {
                  cursor.continue();
                } catch (err) {
                  console.error(
                    'Error continuing cursor for entry not deleted:',
                    err
                  );
                  resolve(removed);
                }
              }
            } catch (err) {
              console.error(
                'Error processing entry in _removeOldEntries:',
                err
              );
              resolve(removed);
            }
          };
        } catch (err) {
          console.error(
            'Error creating transaction in _removeOldEntries:',
            err
          );
          resolve(0);
        }
      });
    } catch (err) {
      console.error('_removeOldEntries error:', err);
      return 0;
    }
  }

  /**
   * Get an estimate of the total cache size
   *
   * @private
   * @returns {Promise<number>} Size estimate in bytes
   */
  async _getCacheSizeEstimate() {
    try {
      const db = await this.dbPromise;
      let totalSize = 0;

      return new Promise((resolve, reject) => {
        try {
          const transaction = db.transaction(this.storeName, 'readonly');
          const store = transaction.objectStore(this.storeName);

          // Check if the index exists before using it
          if (!store.indexNames.contains(this.SIZE_INDEX)) {
            console.error(`Required index ${this.SIZE_INDEX} not found`);
            resolve(0);
            return;
          }

          const index = store.index(this.SIZE_INDEX);

          // Get the sum of all entry sizes
          const request = index.openCursor();

          request.onerror = (event) => {
            console.error(
              'Cursor error in _getCacheSizeEstimate:',
              /** @type {IDBRequest} */ (event.target).error
            );
            resolve(totalSize); // Resolve with what we have so far
          };

          request.onsuccess = (event) => {
            const cursor = /** @type {IDBRequest} */ (event.target).result;

            if (!cursor) {
              resolve(totalSize);
              return;
            }

            try {
              const entry = cursor.value;
              totalSize += entry.size || 0;

              // Continue to next entry
              cursor.continue();
            } catch (err) {
              console.error(
                'Error processing cursor in _getCacheSizeEstimate:',
                err
              );
              resolve(totalSize); // Resolve with what we have so far
            }
          };
        } catch (err) {
          console.error('Error in _getCacheSizeEstimate transaction:', err);
          resolve(0);
        }
      });
    } catch (err) {
      console.error('_getCacheSizeEstimate error:', err);
      return 0;
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    try {
      // Wait for any in-progress operations to complete
      if (this.cleanupState.inProgress) {
        await new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!this.cleanupState.inProgress) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 50); // Check every 50ms

          // Safety timeout after 2 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve();
          }, 2000);
        });
      }

      // Clear any pending cleanup timer
      if (this.postponeCleanupTimer) {
        clearTimeout(this.postponeCleanupTimer);
        this.postponeCleanupTimer = null;
      }

      // Close the database
      const db = await this.dbPromise;
      if (db) {
        db.close();
      }

      // console.log('IndexedDB cache closed successfully');
    } catch (err) {
      console.error('Error closing IndexedDB cache:', err);
    }
  }
}
