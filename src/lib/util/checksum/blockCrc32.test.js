/**
 * Unit tests for block-based CRC32 calculation
 */

import { test, expect } from 'vitest';
import {
  bufferToBlockCrc32,
  blockCrc32Iterator,
  bufferChecksumEquals,
  optimalBlockSize
} from './blockCrc32.js';
import { CRC32, CRC32C } from './crcTables.js';

function stringToBuffer(str) {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function createLargeBuffer(size, fillByte = 0x41) {
  const buffer = new Uint8Array(size);
  buffer.fill(fillByte);
  return buffer;
}

test('bufferToBlockCrc32 returns expected structure', () => {
  const buffer = stringToBuffer('hello world test data');
  const result = bufferToBlockCrc32(buffer, 5);
  
  expect(result).toHaveProperty('checksumList');
  expect(result).toHaveProperty('blockSize');
  expect(result).toHaveProperty('toBase58');
  expect(Array.isArray(result.checksumList)).toBe(true);
  expect(typeof result.blockSize).toBe('number');
  expect(typeof result.toBase58).toBe('function');
});

test('bufferToBlockCrc32 with custom block size', () => {
  const buffer = stringToBuffer('hello world test');
  const result = bufferToBlockCrc32(buffer, 5);
  
  expect(result.blockSize).toBe(5);
  expect(result.checksumList.length).toBe(Math.ceil(buffer.length / 5));
});

test('bufferToBlockCrc32 auto block size', () => {
  const buffer = stringToBuffer('hello');
  const result = bufferToBlockCrc32(buffer);
  
  expect(result.blockSize).toBe(buffer.length); // Small buffer
  expect(result.checksumList.length).toBe(1);
});

test('blockCrc32Iterator yields correct blocks', () => {
  const buffer = stringToBuffer('hello world');
  const blocks = Array.from(blockCrc32Iterator(buffer, 5));
  
  expect(blocks.length).toBe(3); // 11 bytes / 5 = 3 blocks
  
  expect(blocks[0]).toHaveProperty('value');
  expect(blocks[0]).toHaveProperty('offset');
  expect(blocks[0]).toHaveProperty('size');
  expect(blocks[0]).toHaveProperty('toBase58');
  
  expect(blocks[0].offset).toBe(0);
  expect(blocks[0].size).toBe(5);
  expect(blocks[1].offset).toBe(5);
  expect(blocks[1].size).toBe(5);
  expect(blocks[2].offset).toBe(10);
  expect(blocks[2].size).toBe(1); // Last block is smaller
});

test('blockCrc32Iterator with CRC32C variant', () => {
  const buffer = stringToBuffer('test');
  const blocks = Array.from(blockCrc32Iterator(buffer, 2, CRC32C));
  
  expect(blocks.length).toBe(2);
  expect(typeof blocks[0].value).toBe('number');
  expect(typeof blocks[1].value).toBe('number');
});

test('bufferChecksumEquals validates correctly', () => {
  const buffer = stringToBuffer('hello');
  const result = bufferToBlockCrc32(buffer, 3);
  const checksum = result.toBase58();
  
  expect(bufferChecksumEquals(buffer, checksum, 3)).toBe(true);
  expect(bufferChecksumEquals(buffer, 'wrong', 3)).toBe(false);
});

test('bufferChecksumEquals with partial match fails', () => {
  const buffer = stringToBuffer('hello world');
  const result = bufferToBlockCrc32(buffer, 5);
  const checksum = result.toBase58();
  
  // Should fail if buffer is longer than expected
  const shorterBuffer = stringToBuffer('hello');
  expect(bufferChecksumEquals(shorterBuffer, checksum, 5)).toBe(false);
});

test('optimalBlockSize for small buffers', () => {
  const smallBuffer = new Uint8Array(1000);
  const blockSize = optimalBlockSize(smallBuffer);
  expect(blockSize).toBe(1000); // Returns full size for small buffers
});

test('optimalBlockSize for large buffers', () => {
  const largeBuffer = createLargeBuffer(5000000);
  const blockSize = optimalBlockSize(largeBuffer);
  
  expect(blockSize).toBeGreaterThanOrEqual(100000); // At least min size
  expect(blockSize).toBeLessThanOrEqual(largeBuffer.length);
});

test('optimalBlockSize with different buffer types', () => {
  const uint8Array = new Uint8Array(200000);
  const arrayBuffer = new ArrayBuffer(200000);
  const dataView = new DataView(arrayBuffer);
  
  const size1 = optimalBlockSize(uint8Array);
  const size2 = optimalBlockSize(arrayBuffer);
  const size3 = optimalBlockSize(dataView);
  
  expect(size1).toBe(size2);
  expect(size2).toBe(size3);
});

test('toBase58 produces string output', () => {
  const buffer = stringToBuffer('test');
  const result = bufferToBlockCrc32(buffer, 2);
  const base58 = result.toBase58();
  
  expect(typeof base58).toBe('string');
  expect(base58.length).toBeGreaterThan(0);
});

test('block toBase58 produces string output', () => {
  const buffer = stringToBuffer('test');
  const blocks = Array.from(blockCrc32Iterator(buffer, 2));
  
  for (const block of blocks) {
    const base58 = block.toBase58();
    expect(typeof base58).toBe('string');
    expect(base58.length).toBeGreaterThan(0);
  }
});

test('consistent checksums for same data', () => {
  const buffer1 = stringToBuffer('identical data');
  const buffer2 = stringToBuffer('identical data');
  
  const result1 = bufferToBlockCrc32(buffer1, 5);
  const result2 = bufferToBlockCrc32(buffer2, 5);
  
  expect(result1.checksumList).toEqual(result2.checksumList);
  expect(result1.toBase58()).toBe(result2.toBase58());
});

test('different checksums for different data', () => {
  const buffer1 = stringToBuffer('data one');
  const buffer2 = stringToBuffer('data two');
  
  const result1 = bufferToBlockCrc32(buffer1, 4);
  const result2 = bufferToBlockCrc32(buffer2, 4);
  
  expect(result1.checksumList).not.toEqual(result2.checksumList);
  expect(result1.toBase58()).not.toBe(result2.toBase58());
});

test('handles empty buffer', () => {
  const buffer = new Uint8Array(0);
  const result = bufferToBlockCrc32(buffer, 5);
  
  expect(result.checksumList).toEqual([]);
  expect(result.toBase58()).toBe('');
});

test('large buffer processing', () => {
  const largeBuffer = createLargeBuffer(500000, 0x42);
  const result = bufferToBlockCrc32(largeBuffer);
  
  expect(result.checksumList.length).toBeGreaterThan(1);
  expect(typeof result.toBase58()).toBe('string');
  expect(result.toBase58().length).toBeGreaterThan(0);
});

test('iterator can be consumed multiple times', () => {
  const buffer = stringToBuffer('test data');
  
  const blocks1 = Array.from(blockCrc32Iterator(buffer, 3));
  const blocks2 = Array.from(blockCrc32Iterator(buffer, 3));
  
  // Compare data properties (functions aren't equal by reference)
  expect(blocks1.length).toBe(blocks2.length);
  
  for (let i = 0; i < blocks1.length; i++) {
    expect(blocks1[i].value).toBe(blocks2[i].value);
    expect(blocks1[i].offset).toBe(blocks2[i].offset);
    expect(blocks1[i].size).toBe(blocks2[i].size);
    expect(blocks1[i].toBase58()).toBe(blocks2[i].toBase58());
  }
});