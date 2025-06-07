/**
 * @fileoverview Unit tests for MemoryResponseCache
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MemoryResponseCache from './MemoryResponseCache.js';

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

  get headers() {
    return {
      get: (name) => this._headers.get(name),
      entries: () => this._headers.entries()
    };
  }
}

describe('MemoryResponseCache', () => {
  let cache;

  beforeEach(() => {
    cache = new MemoryResponseCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store and retrieve responses', async () => {
    // Create a test URL
    const testUrl = 'https://example.com/test';

    // Create a mock response
    const response = new MockResponse('test data', {
      url: testUrl,
      headers: [['Content-Type', 'text/plain']]
    });

    // Store in cache
    await cache.set('test-key', response, { foo: 'bar' });

    // Retrieve from cache
    const cachedEntry = await cache.get('test-key');

    // Verify entry properties
    expect(cachedEntry).not.toBeNull();
    expect(cachedEntry.metadata).toEqual({ foo: 'bar' });
    expect(cachedEntry.url).toBe(testUrl);
  });

  it('should handle missing entries', async () => {
    const result = await cache.get('non-existent');
    expect(result).toBeNull();
  });

  it('should handle expired entries', async () => {
    const response = new MockResponse('test data');

    // Set with expiration in the past
    const pastTime = Date.now() - 10000; // 10 seconds in the past
    await cache.set('expired-key', response, { expires: pastTime });

    // Should return null for expired entry
    const result = await cache.get('expired-key');
    expect(result).toBeNull();

    // Entry should be removed from cache
    expect(cache.cache.has('expired-key')).toBe(false);
  });

  it('should handle future expiration correctly', async () => {
    const response = new MockResponse('test data');

    // Set with expiration in the future
    const futureTime = Date.now() + 10000; // 10 seconds in the future
    await cache.set('future-key', response, { expires: futureTime });

    // Should return entry for non-expired entry
    const result = await cache.get('future-key');
    expect(result).not.toBeNull();
    expect(result.expires).toBe(futureTime);
  });

  it('should support expiresIn parameter', async () => {
    const response = new MockResponse('test data');

    // Mock Date.now to return a fixed timestamp
    const now = 1609459200000; // 2021-01-01
    vi.spyOn(Date, 'now').mockReturnValue(now);

    // Set with expiresIn
    const expiresIn = 3600000; // 1 hour
    await cache.set('expires-in-key', response, { expiresIn });

    // Get the entry (while mock is still active)
    const result = await cache.get('expires-in-key');

    // Restore the mock
    vi.spyOn(Date, 'now').mockRestore();

    // Verify expiration
    expect(result).not.toBeNull();
    expect(result.expires).toBe(now + expiresIn);
  });

  it('should delete entries', async () => {
    const response = new MockResponse('test data');

    // Add an entry
    await cache.set('delete-key', response, {});

    // Verify it exists
    expect(await cache.get('delete-key')).not.toBeNull();

    // Delete it
    const deleteResult = await cache.delete('delete-key');

    // Verify delete result and entry is gone
    expect(deleteResult).toBe(true);
    expect(await cache.get('delete-key')).toBeNull();
  });

  it('should clear all entries', async () => {
    // Add multiple entries
    const response = new MockResponse('test data');
    await cache.set('key1', response, {});
    await cache.set('key2', response, {});
    await cache.set('key3', response, {});

    // Verify entries exist
    expect(await cache.get('key1')).not.toBeNull();
    expect(await cache.get('key2')).not.toBeNull();
    expect(await cache.get('key3')).not.toBeNull();

    // Clear cache
    await cache.clear();

    // Verify all entries are gone
    expect(await cache.get('key1')).toBeNull();
    expect(await cache.get('key2')).toBeNull();
    expect(await cache.get('key3')).toBeNull();
  });

  it('should handle ETag and Last-Modified headers', async () => {
    // Create response with cache-related headers
    const headers = [
      ['ETag', '"123456"'],
      ['Last-Modified', 'Wed, 21 Oct 2015 07:28:00 GMT']
    ];

    const response = new MockResponse('test data', { headers });

    // Set in cache
    await cache.set('header-key', response, {});

    // Get from cache
    const result = await cache.get('header-key');

    // Verify headers were stored
    expect(result.etag).toBe('"123456"');
    expect(result.lastModified).toBe('Wed, 21 Oct 2015 07:28:00 GMT');
  });

  it('should have a no-op close method for compatibility', async () => {
    // Ensure close method exists
    expect(typeof cache.close).toBe('function');

    // Ensure it can be called without errors
    await expect(cache.close()).resolves.not.toThrow();
  });
});
