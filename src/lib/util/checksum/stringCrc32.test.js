/**
 * Unit tests for string CRC32 calculation
 */

import { test, expect } from 'vitest';
import { stringToCrc32, CRC32, CRC32C } from './stringCrc32.js';

test('calculates known CRC32 values', () => {
  expect(stringToCrc32('hello')).toBe(0x3610a686);
  expect(stringToCrc32('world')).toBe(0x3a771143);
  expect(stringToCrc32('hello world')).toBe(0xd4a1185);
  expect(stringToCrc32('123456789')).toBe(0xcbf43926); // Standard test vector
  expect(stringToCrc32('')).toBe(0);
});

test('calculates known CRC32C values', () => {
  expect(stringToCrc32('hello', CRC32C)).toBe(0x9a71bb4c);
  expect(stringToCrc32('world', CRC32C)).toBe(0x31aa814e);
  expect(stringToCrc32('hello world', CRC32C)).toBe(0xc99465aa);
  expect(stringToCrc32('123456789', CRC32C)).toBe(0xe3069283); // Standard test vector
  expect(stringToCrc32('', CRC32C)).toBe(0);
});

test('returns unsigned 32-bit integers', () => {
  const result = stringToCrc32('test');
  expect(result).toBeGreaterThanOrEqual(0);
  expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
  expect(Number.isInteger(result)).toBe(true);
});

test('different strings produce different checksums', () => {
  const crc1 = stringToCrc32('hello');
  const crc2 = stringToCrc32('hello2');
  expect(crc1).not.toBe(crc2);
});

test('same string produces same checksum', () => {
  const crc1 = stringToCrc32('consistent');
  const crc2 = stringToCrc32('consistent');
  expect(crc1).toBe(crc2);
});

test('handles unicode characters', () => {
  const result1 = stringToCrc32('café');
  const result2 = stringToCrc32('πλήθος');
  const result3 = stringToCrc32('🚀');
  
  expect(typeof result1).toBe('number');
  expect(typeof result2).toBe('number');
  expect(typeof result3).toBe('number');
});

test('defaults to CRC32 variant', () => {
  const defaultResult = stringToCrc32('test');
  const explicitResult = stringToCrc32('test', CRC32);
  expect(defaultResult).toBe(explicitResult);
});

test('handles long strings', () => {
  const longString = 'a'.repeat(10000);
  const result = stringToCrc32(longString);
  expect(typeof result).toBe('number');
  expect(result).toBeGreaterThanOrEqual(0);
});

test('case sensitivity', () => {
  const lower = stringToCrc32('hello');
  const upper = stringToCrc32('HELLO');
  expect(lower).not.toBe(upper);
});

test('handles special characters', () => {
  const special = stringToCrc32('!@#$%^&*()_+-=[]{}|;:,.<>?');
  expect(typeof special).toBe('number');
  expect(special).toBeGreaterThanOrEqual(0);
});