/**
 * @fileoverview Unit tests for IndexedDbCache
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import IndexedDbCache from './IndexedDbCache.js';
import 'fake-indexeddb/auto';

// Simple mock Response implementation for tests
class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.url = init.url || '';
    this._headers = new Map(init.headers || []);
  }
  
  clone() {
    return new MockResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      headers: Array.from(this._headers.entries())
    });
  }
  
  // Add blob method to better mimic Response
  async blob() {
    return new Blob([this.body]);
  }

  get headers() {
    return {
      get: (name) => this._headers.get(name),
      entries: () => this._headers.entries()
    };
  }
}

// Mock blob for tests if needed
if (typeof Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(content) {
      this._content = content;
      this.size = content.reduce((sum, item) => sum + item.length, 0);
    }
  };
}

// Mock headers if needed
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(entries = []) {
      this._headers = new Map(entries);
    }

    get(name) {
      return this._headers.get(name);
    }

    entries() {
      return this._headers.entries();
    }
  };
}

describe('IndexedDbCache', () => {
  let cache;
  let uniqueId;

  beforeEach(async () => {
    // Create a unique ID for each test to avoid DB conflicts
    uniqueId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create a fresh cache instance
    cache = new IndexedDbCache({
      dbName: `cache-test-${uniqueId}`,
      storeName: `cache-store-${uniqueId}`,
      // Use smaller values for tests
      maxAge: 1000, // 1 second
      cleanupInterval: 100, // 100ms
      cleanupBatchSize: 5
    });

    // No need to mock browser APIs since IndexedDbCache now has safe checks
    
    // Wait for DB connection to be established
    await cache.dbPromise;
  });
  
  afterEach(async () => {
    // Clean up
    if (cache) {
      await cache.clear();
      cache.close();
    }
    
    // Clean up any mock timers
    vi.restoreAllMocks();
  });
  
  it('should store and retrieve responses', async () => {
    // Create a test response
    const testUrl = 'https://example.com/test';
    const testData = 'test data content';
    
    const response = new MockResponse(testData, {
      url: testUrl,
      headers: [['Content-Type', 'text/plain']]
    });
    
    // Store in cache
    await cache.set('test-key', response, { foo: 'bar' });
    
    // Retrieve from cache
    const cachedEntry = await cache.get('test-key');
    
    // Verify entry
    expect(cachedEntry).not.toBeNull();
    expect(cachedEntry.metadata).toEqual({ foo: 'bar' });
    expect(cachedEntry.url).toBe(testUrl);
  });
  
  it('should handle expired entries', async () => {
    // Create a test response
    const response = new MockResponse('test data');
    
    // Store with already expired
    await cache.set('expired-key', response, { expires: Date.now() - 10 });
    
    // Should return null for expired entries
    const result = await cache.get('expired-key');
    expect(result).toBeNull();
  });
  
  it('should delete entries', async () => {
    // Create and store a test response
    const response = new MockResponse('test data');
    await cache.set('delete-test-key', response, {});
    
    // Verify it exists
    const initialEntry = await cache.get('delete-test-key');
    expect(initialEntry).not.toBeNull();
    
    // Delete it
    const deleteResult = await cache.delete('delete-test-key');
    expect(deleteResult).toBe(true);
    
    // Verify it's gone
    const afterDelete = await cache.get('delete-test-key');
    expect(afterDelete).toBeNull();
  });
  
  it('should clear all entries', async () => {
    // Add multiple entries
    const response = new MockResponse('test data');
    await Promise.all([
      cache.set('clear-test-1', response, {}),
      cache.set('clear-test-2', response, {}),
      cache.set('clear-test-3', response, {})
    ]);
    
    // Verify they exist
    const entry1 = await cache.get('clear-test-1');
    expect(entry1).not.toBeNull();
    
    // Clear the cache
    await cache.clear();
    
    // Verify all entries are gone
    const afterClear1 = await cache.get('clear-test-1');
    const afterClear2 = await cache.get('clear-test-2');
    const afterClear3 = await cache.get('clear-test-3');
    
    expect(afterClear1).toBeNull();
    expect(afterClear2).toBeNull();
    expect(afterClear3).toBeNull();
  });
  
  it('should handle expiresIn parameter', async () => {
    const response = new MockResponse('test data');
    
    // Fix time to make testing deterministic
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    
    // Set with expiresIn
    const expiresIn = 60000; // 1 minute
    await cache.set('expires-in-key', response, { expiresIn });
    
    // Verify the calculated expiration is correct
    const entry = await cache.get('expires-in-key');
    expect(entry).not.toBeNull();
    expect(entry.expires).toBe(now + expiresIn);
    
    // Reset mock
    vi.spyOn(Date, 'now').mockRestore();
  });
});
