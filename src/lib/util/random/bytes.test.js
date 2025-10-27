/**
 * Unit tests for random bytes utilities
 *
 * @description
 * Tests for cross-platform random byte generation functions
 */

import { describe, it, expect } from 'vitest';

import {
  randomBytes,
  randomBytesBase64,
  randomBytesHex
} from '$lib/util/random';

describe('randomBytes', () => {
  it('should generate bytes of the correct length', () => {
    const bytes = randomBytes(16);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(16);
  });

  it('should generate different bytes on consecutive calls', () => {
    const bytes1 = randomBytes(16);
    const bytes2 = randomBytes(16);

    // Convert to arrays for comparison
    const arr1 = Array.from(bytes1);
    const arr2 = Array.from(bytes2);

    expect(arr1).not.toEqual(arr2);
  });

  it('should generate bytes with various lengths', () => {
    expect(randomBytes(1).length).toBe(1);
    expect(randomBytes(8).length).toBe(8);
    expect(randomBytes(32).length).toBe(32);
    expect(randomBytes(64).length).toBe(64);
  });

  it('should generate bytes within valid range (0-255)', () => {
    const bytes = randomBytes(100);

    for (let i = 0; i < bytes.length; i++) {
      expect(bytes[i]).toBeGreaterThanOrEqual(0);
      expect(bytes[i]).toBeLessThanOrEqual(255);
    }
  });

  it('should throw error for invalid length', () => {
    expect(() => randomBytes(0)).toThrow();
    expect(() => randomBytes(-1)).toThrow();
    expect(() => randomBytes('16')).toThrow();
  });

  it('should have good entropy (not all zeros)', () => {
    const bytes = randomBytes(32);
    const allZeros = Array.from(bytes).every((byte) => byte === 0);
    expect(allZeros).toBe(false);
  });

  it('should have good distribution', () => {
    // Generate many bytes and check they use different values
    const bytes = randomBytes(256);
    const uniqueValues = new Set(bytes);

    // Should have at least 100 different values in 256 bytes
    expect(uniqueValues.size).toBeGreaterThan(100);
  });
});

describe('randomBytesBase64', () => {
  it('should generate base64 string', () => {
    const base64 = randomBytesBase64(16);

    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);

    // Base64 should only contain valid characters
    expect(/^[A-Za-z0-9+/=]+$/.test(base64)).toBe(true);
  });

  it('should generate different base64 strings on consecutive calls', () => {
    const base64_1 = randomBytesBase64(16);
    const base64_2 = randomBytesBase64(16);

    expect(base64_1).not.toBe(base64_2);
  });

  it('should generate base64 with appropriate length', () => {
    // Base64 encodes 3 bytes into 4 characters
    // 16 bytes should produce ~22 characters (with padding)
    const base64 = randomBytesBase64(16);
    expect(base64.length).toBeGreaterThanOrEqual(20);
    expect(base64.length).toBeLessThanOrEqual(24);
  });

  it('should be decodable back to bytes', () => {
    const originalLength = 16;
    const base64 = randomBytesBase64(originalLength);

    // Decode using Buffer (Node.js) or atob (browser simulation)
    let decoded;
    if (typeof Buffer !== 'undefined') {
      decoded = Buffer.from(base64, 'base64');
    } else {
      const binaryString = atob(base64);
      decoded = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        decoded[i] = binaryString.charCodeAt(i);
      }
    }

    expect(decoded.length).toBe(originalLength);
  });
});

describe('randomBytesHex', () => {
  it('should generate hex string', () => {
    const hex = randomBytesHex(16);

    expect(typeof hex).toBe('string');
    expect(hex.length).toBe(32); // 16 bytes = 32 hex characters

    // Hex should only contain valid characters (0-9, a-f)
    expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
  });

  it('should generate different hex strings on consecutive calls', () => {
    const hex1 = randomBytesHex(16);
    const hex2 = randomBytesHex(16);

    expect(hex1).not.toBe(hex2);
  });

  it('should generate hex with correct length', () => {
    // Each byte = 2 hex characters
    expect(randomBytesHex(1).length).toBe(2);
    expect(randomBytesHex(8).length).toBe(16);
    expect(randomBytesHex(16).length).toBe(32);
    expect(randomBytesHex(32).length).toBe(64);
  });

  it('should pad single-digit hex values with zero', () => {
    // Generate many bytes to statistically get some values < 16
    const hex = randomBytesHex(100);

    // Check that length is exactly 200 (no missing padding)
    expect(hex.length).toBe(200);

    // Check every 2 characters form valid hex
    for (let i = 0; i < hex.length; i += 2) {
      const byte = hex.slice(i, i + 2);
      expect(byte.length).toBe(2);
      expect(/^[0-9a-f]{2}$/.test(byte)).toBe(true);
    }
  });

  it('should be convertible back to bytes', () => {
    const originalLength = 16;
    const hex = randomBytesHex(originalLength);

    // Convert hex string back to bytes
    const bytes = new Uint8Array(originalLength);
    for (let i = 0; i < originalLength; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }

    expect(bytes.length).toBe(originalLength);

    // All values should be valid bytes (0-255)
    for (let i = 0; i < bytes.length; i++) {
      expect(bytes[i]).toBeGreaterThanOrEqual(0);
      expect(bytes[i]).toBeLessThanOrEqual(255);
    }
  });
});
