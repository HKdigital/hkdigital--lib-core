

/**
 * ReponseCache
 * Using IndexedDB for persistent storage
 */
export default class ResponseCache {
  /**
   * Create a new IndexedDB cache storage
   * @param {string} dbName Database name
   * @param {string} storeName Store name
   */
  constructor(dbName = 'http-cache', storeName = 'responses') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbPromise = this._openDatabase();
  }
  
  /**
   * Open the IndexedDB database
   * @private
   * @returns {Promise<IDBDatabase>}
   */
  async _openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }
  
  /**
   * Get a cached response
   * @param {string} key Cache key
   * @returns {Promise<import('./typedef').CacheEntry|null>}
   */
  async get(key) {
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const entry = request.result;
        
        if (!entry) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (entry.expires && Date.now() > entry.expires) {
          // Delete expired entry
          this.delete(key).catch(console.error);
          resolve(null);
          return;
        }
        
        // Deserialize the response
        const response = new Response(entry.body, {
          status: entry.status,
          statusText: entry.statusText,
          headers: new Headers(entry.headers)
        });
        
        resolve({
          response,
          metadata: entry.metadata,
          url: entry.url,
          timestamp: entry.timestamp,
          expires: entry.expires,
          etag: entry.etag,
          lastModified: entry.lastModified
        });
      };
    });
  }
  
  /**
   * Store a response in the cache
   * @param {string} key Cache key
   * @param {Response} response Response to cache
   * @param {Object} metadata Cache metadata
   * @returns {Promise<void>}
   */
  async set(key, response, metadata) {
    const db = await this.dbPromise;
    
    // Clone the response to avoid consuming it
    const clonedResponse = response.clone();
    
    // Extract response data
    const body = await clonedResponse.blob();
    const headers = Array.from(clonedResponse.headers.entries());
    
    const entry = {
      key,
      url: clonedResponse.url,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
      headers,
      body,
      metadata,
      timestamp: Date.now(),
      expires: metadata.expires || null,
      etag: clonedResponse.headers.get('ETag'),
      lastModified: clonedResponse.headers.get('Last-Modified')
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(entry);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  
  /**
   * Delete a cached response
   * @param {string} key Cache key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }
  
  /**
   * Clear all cached responses
   * @returns {Promise<void>}
   */
  async clear() {
    const db = await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
