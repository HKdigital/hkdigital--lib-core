/**
 * Unit tests for unique.js functionality
 * 
 * @description
 * Tests for functions that generate unique identifiers and random strings
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { 
  randomString, 
  randomStringBase58, 
  randomStringBaseHuman,
  generateLocalId,
  getTimeBasedNumber30s,
  getTwoChar10ms,
  bootTimePrefix
} from '$lib/util/unique';

import { ALPHABET_BASE_HUMAN, ALPHABET_BASE_58 } from '$lib/constants/bases/index.js';
import { TIME_2025_01_01 } from '$lib/constants/time/index.js';

describe('randomString', () => {
  it('should generate string of the correct length', () => {
    expect(randomString(10).length).toBe(10);
    expect(randomString(20).length).toBe(20);
    expect(randomString(48).length).toBe(48); // Default length
  });

  it('should only use characters from the provided alphabet', () => {
    const alphabet = 'abc123';
    const result = randomString(100, alphabet);
    
    // Verify each character in the result is from the alphabet
    for (let i = 0; i < result.length; i++) {
      expect(alphabet).toContain(result[i]);
    }
  });

  it('should use base58 alphabet by default', () => {
    const result = randomString(100);
    
    // Verify each character in the result is from the base58 alphabet
    for (let i = 0; i < result.length; i++) {
      expect(ALPHABET_BASE_58).toContain(result[i]);
    }
  });

  it('should throw an error for invalid length', () => {
    expect(() => randomString(0)).toThrow('Invalid parameter [length]');
    expect(() => randomString(-1)).toThrow('Invalid parameter [length]');
    expect(() => randomString('10')).toThrow('Invalid parameter [length]');
  });

  it('should throw an error for invalid alphabet', () => {
    expect(() => randomString(10, '')).toThrow('Invalid parameter [ALPHABET]');
    expect(() => randomString(10, null)).toThrow('Invalid parameter [ALPHABET]');
    expect(() => randomString(10, 123)).toThrow('Invalid parameter [ALPHABET]');
  });
});

describe('randomStringBase58', () => {
  it('should generate string of the correct length', () => {
    expect(randomStringBase58(10).length).toBe(10);
    expect(randomStringBase58().length).toBe(48); // Default length
  });

  it('should only use characters from the base58 alphabet', () => {
    const result = randomStringBase58(100);
    
    // Verify each character in the result is from the base58 alphabet
    for (let i = 0; i < result.length; i++) {
      expect(ALPHABET_BASE_58).toContain(result[i]);
    }
  });
});

describe('randomStringBaseHuman', () => {
  it('should generate string of the correct length', () => {
    expect(randomStringBaseHuman(10).length).toBe(10);
    expect(randomStringBaseHuman().length).toBe(48); // Default length
  });

  it('should only use characters from the human-friendly alphabet', () => {
    const result = randomStringBaseHuman(100);
    
    // Verify each character in the result is from the human alphabet
    for (let i = 0; i < result.length; i++) {
      expect(ALPHABET_BASE_HUMAN).toContain(result[i]);
    }
  });
});

describe('generateLocalId', () => {
  beforeEach(() => {
    // Reset any memoized state that might affect tests
    vi.restoreAllMocks();
  });

  it('should generate a string ID', () => {
    const id = generateLocalId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(3); // At least prefix + length indicator
  });

  it('should generate unique IDs for consecutive calls', () => {
    const id1 = generateLocalId();
    const id2 = generateLocalId();
    expect(id1).not.toBe(id2);
  });

  it('should create IDs with the right format', () => {
    const id = generateLocalId(60000); // 1 minute as direct time value

    // We know bootTimePrefix should always start with '3'
    expect(id.charAt(0)).toBe('3');

    // ID should be at least 4 characters (prefix + more)
    expect(id.length).toBeGreaterThan(4);
  });

  it('should generate different IDs for different times', () => {
    const time1 = 60000;  // 1 minute
    const time2 = 3600000; // 1 hour

    const id1 = generateLocalId(time1);
    const id2 = generateLocalId(time2);

    expect(id1).not.toBe(id2);
  });
});

describe('getTimeBasedNumber30s', () => {
  it('should return a number', () => {
    const result = getTimeBasedNumber30s();
    expect(typeof result).toBe('number');
  });

  it('should correctly divide time by 30000', () => {
    // Use direct time values instead of TIME_2025_01_01 reference
    const timeValue = 60000; // 60 seconds
    const expected = Math.floor(timeValue / 30000); // Expected: 2

    const result = getTimeBasedNumber30s(timeValue);

    expect(result).toBe(expected);
  });

  it('should return same number for times in same 30s window', () => {
    const time1 = 1000; // 1 second
    const time2 = 29999; // just under 30 seconds - same window

    const result1 = getTimeBasedNumber30s(time1);
    const result2 = getTimeBasedNumber30s(time2);

    expect(result1).toBe(result2);
    expect(result1).toBe(0); // First window is 0
  });

  it('should return different numbers for times in different 30s windows', () => {
    const time1 = 29999; // just under 30 seconds
    const time2 = 30001; // just over 30 seconds - new window

    const result1 = getTimeBasedNumber30s(time1);
    const result2 = getTimeBasedNumber30s(time2);

    expect(result1).not.toBe(result2);
    expect(result1).toBe(0); // First window is 0
    expect(result2).toBe(1); // Second window is 1
  });
});

describe('getTwoChar10ms', () => {
  it('should return a string of length 2', () => {
    const result = getTwoChar10ms();
    expect(typeof result).toBe('string');
    expect(result.length).toBe(2);
  });

  it('should return the same value for times within the same 10ms window', () => {
    // Direct time values instead of TIME_2025_01_01 reference
    const time1 = 100;
    const time2 = 109; // Same 10ms window

    const result1 = getTwoChar10ms(time1);
    const result2 = getTwoChar10ms(time2);

    expect(result1).toBe(result2);
  });

  it('should return different values for times in different 10ms windows', () => {
    // Direct time values
    const time1 = 100;
    const time2 = 110; // Next 10ms window

    const result1 = getTwoChar10ms(time1);
    const result2 = getTwoChar10ms(time2);

    expect(result1).not.toBe(result2);
  });

  it('should use correct characters from base58 alphabet', () => {
    const result = getTwoChar10ms(1000); // Use fixed time for predictable output

    // Check both characters are from base58 alphabet
    expect(ALPHABET_BASE_58).toContain(result[0]);
    expect(ALPHABET_BASE_58).toContain(result[1]);
  });

  it('should start with "1" for small time values', () => {
    // Calculate a value that would produce num < 58
    // num = Math.floor(timeMs / 10) % 3364
    // For num = 57 (just under 58): timeMs = 570
    const smallTime = 570;

    const result = getTwoChar10ms(smallTime);

    expect(result[0]).toBe('1');
  });
});

describe('bootTimePrefix', () => {
  beforeEach(() => {
    // Reset the module to clear memoized bootTimePrefix
    vi.resetModules();

    // Mock Date.now for consistent testing
    vi.spyOn(Date, 'now').mockImplementation(() => TIME_2025_01_01 + 1000);
  });

  it('should return a string of length 3', () => {
    const result = bootTimePrefix();
    expect(typeof result).toBe('string');
    expect(result.length).toBe(3);
  });

  it('should always start with "3"', () => {
    const result = bootTimePrefix();
    expect(result[0]).toBe('3');
  });

  it('should return the same value for multiple calls', () => {
    const result1 = bootTimePrefix();
    const result2 = bootTimePrefix();

    expect(result1).toBe(result2);
  });
});
