/**
 * ReponseCache
 * Using in-memory storage
 */
export default class MemoryResponseCache {
  constructor() {
    this.cache = new Map();
  }
  
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
  
  async set(key, response, metadata) {
    this.cache.set(key, {
      response: response.clone(),
      metadata,
      url: response.url,
      timestamp: Date.now(),
      expires: metadata.expires || null,
      etag: response.headers.get('ETag'),
      lastModified: response.headers.get('Last-Modified')
    });
  }
  
  async delete(key) {
    return this.cache.delete(key);
  }
  
  async clear() {
    this.cache.clear();
  }
}
