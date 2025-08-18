import { describe, it, expect, vi } from 'vitest';
import * as generators from './generators.js';

// Mock the dependencies
vi.mock('$lib/util/bases.js', () => ({
  base58fromNumber: vi.fn(() => 'mockedBase58String'),
  bytesToNumber: vi.fn(() => BigInt(12345))
}));

vi.mock('$lib/util/random.js', () => ({
  randomBytesBase64: vi.fn(() => 'mockedBase64String'),
  randomBytes: vi.fn(() => new Uint8Array([1, 2, 3, 4]))
}));

describe('generateSecretKeyBase64', () => {
  it('should generate base64 secret with default 64 bytes', () => {
    const result = generators.generateSecretKeyBase64();
    expect(result).toBe('mockedBase64String');
  });

  it('should generate base64 secret with custom byte length', () => {
    const result = generators.generateSecretKeyBase64(32);
    expect(result).toBe('mockedBase64String');
  });

  it('should call randomBytesBase64 with correct parameter', async () => {
    const { randomBytesBase64 } = await import('$lib/util/random.js');
    
    generators.generateSecretKeyBase64(128);
    expect(randomBytesBase64).toHaveBeenCalledWith(128);
  });
});

describe('generateSecretKeyForHmacBase58', () => {
  it('should generate base58 HMAC secret key', () => {
    const result = generators.generateSecretKeyForHmacBase58();
    expect(result).toBe('mockedBase58String');
  });

  it('should use 64 bytes for random generation', async () => {
    const { randomBytes } = await import('$lib/util/random.js');
    
    generators.generateSecretKeyForHmacBase58();
    expect(randomBytes).toHaveBeenCalledWith(64);
  });

  it('should convert bytes to number and then to base58', async () => {
    const { bytesToNumber } = await import('$lib/util/bases.js');
    const { base58fromNumber } = await import('$lib/util/bases.js');
    
    generators.generateSecretKeyForHmacBase58();
    
    expect(bytesToNumber).toHaveBeenCalledWith(new Uint8Array([1, 2, 3, 4]));
    expect(base58fromNumber).toHaveBeenCalledWith(BigInt(12345));
  });
});