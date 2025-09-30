/**
 * Unit tests for buffer CRC32 calculation
 */

import { test, expect } from 'vitest';
import { bufferToCrc32 } from './bufferCrc32.js';
import { CRC32, CRC32C } from './crcTables.js';

function createTestBuffer(data) {
  const buffer = new ArrayBuffer(data.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < data.length; i++) {
    view[i] = data[i];
  }
  return buffer;
}

function stringToBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

test('calculates CRC32 for ArrayBuffer', () => {
  const buffer = createTestBuffer([0x68, 0x65, 0x6c, 0x6c, 0x6f]); // 'hello'
  const result = bufferToCrc32(buffer);
  expect(result).toBe(0x3610a686);
});

test('calculates CRC32 for Uint8Array', () => {
  const buffer = stringToBuffer('hello');
  const result = bufferToCrc32(buffer);
  expect(result).toBe(0x3610a686);
});

test('calculates CRC32 for DataView', () => {
  const arrayBuffer = createTestBuffer([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
  const dataView = new DataView(arrayBuffer);
  const result = bufferToCrc32(dataView);
  expect(result).toBe(0x3610a686);
});

test('calculates CRC32C variant', () => {
  const buffer = stringToBuffer('hello');
  const result = bufferToCrc32(buffer, 0, undefined, CRC32C);
  expect(result).toBe(0x9a71bb4c);
});

test('handles empty buffer', () => {
  const buffer = new ArrayBuffer(0);
  const result = bufferToCrc32(buffer);
  expect(result).toBe(0);
});

test('handles byte offset', () => {
  const buffer = stringToBuffer('xhellox');
  const result = bufferToCrc32(buffer, 1, 5); // Skip first and last byte
  expect(result).toBe(0x3610a686); // Should be same as 'hello'
});

test('handles byte length limit', () => {
  const buffer = stringToBuffer('hello world');
  const result = bufferToCrc32(buffer, 0, 5); // Only first 5 bytes
  expect(result).toBe(0x3610a686); // Should be same as 'hello'
});

test('handles offset and length together', () => {
  const buffer = stringToBuffer('xhellox');
  const result = bufferToCrc32(buffer, 1, 5);
  expect(result).toBe(0x3610a686);
});

test('DataView with offset and length', () => {
  const arrayBuffer = stringToBuffer('prefix-hello-suffix');
  const dataView = new DataView(arrayBuffer.buffer, 7, 5); // 'hello' part
  const result = bufferToCrc32(dataView);
  expect(result).toBe(0x3610a686);
});

test('returns unsigned 32-bit integers', () => {
  const buffer = stringToBuffer('test data');
  const result = bufferToCrc32(buffer);
  
  expect(result).toBeGreaterThanOrEqual(0);
  expect(result).toBeLessThanOrEqual(0xFFFFFFFF);
  expect(Number.isInteger(result)).toBe(true);
});

test('different buffers produce different checksums', () => {
  const buffer1 = stringToBuffer('hello');
  const buffer2 = stringToBuffer('world');
  
  const crc1 = bufferToCrc32(buffer1);
  const crc2 = bufferToCrc32(buffer2);
  
  expect(crc1).not.toBe(crc2);
});

test('same buffer content produces same checksum', () => {
  const buffer1 = stringToBuffer('consistent');
  const buffer2 = stringToBuffer('consistent');
  
  const crc1 = bufferToCrc32(buffer1);
  const crc2 = bufferToCrc32(buffer2);
  
  expect(crc1).toBe(crc2);
});

test('defaults to CRC32 variant', () => {
  const buffer = stringToBuffer('test');
  const defaultResult = bufferToCrc32(buffer);
  const explicitResult = bufferToCrc32(buffer, 0, undefined, CRC32);
  
  expect(defaultResult).toBe(explicitResult);
});

test('throws for unsupported buffer type', () => {
  expect(() => bufferToCrc32('not a buffer')).toThrow('Unsupported buffer type');
  expect(() => bufferToCrc32(null)).toThrow('Unsupported buffer type');
  expect(() => bufferToCrc32({})).toThrow('Unsupported buffer type');
});

test('handles large buffers', () => {
  const largeBuffer = new Uint8Array(100000);
  largeBuffer.fill(0x42);
  
  const result = bufferToCrc32(largeBuffer);
  expect(typeof result).toBe('number');
  expect(result).toBeGreaterThanOrEqual(0);
});