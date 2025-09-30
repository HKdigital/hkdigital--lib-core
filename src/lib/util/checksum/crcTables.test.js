/**
 * Unit tests for CRC table generation utilities
 */

import { test, expect } from 'vitest';
import { getCrcTable, CRC32, CRC32C } from './crcTables.js';

test('exports correct constants', () => {
  expect(CRC32).toBe('crc32');
  expect(CRC32C).toBe('crc32c');
});

test('getCrcTable returns valid CRC32 table', () => {
  const table = getCrcTable(CRC32);
  
  expect(table).toBeInstanceOf(Array);
  expect(table.length).toBe(256);
  expect(typeof table[0]).toBe('number');
  expect(typeof table[255]).toBe('number');
});

test('getCrcTable returns valid CRC32C table', () => {
  const table = getCrcTable(CRC32C);
  
  expect(table).toBeInstanceOf(Array);
  expect(table.length).toBe(256);
  expect(typeof table[0]).toBe('number');
  expect(typeof table[255]).toBe('number');
});

test('getCrcTable caches tables', () => {
  const table1 = getCrcTable(CRC32);
  const table2 = getCrcTable(CRC32);
  
  expect(table1).toBe(table2);
});

test('CRC32 and CRC32C tables are different', () => {
  const crc32Table = getCrcTable(CRC32);
  const crc32cTable = getCrcTable(CRC32C);
  
  expect(crc32Table).not.toEqual(crc32cTable);
});

test('getCrcTable defaults to CRC32', () => {
  const defaultTable = getCrcTable();
  const crc32Table = getCrcTable(CRC32);
  
  expect(defaultTable).toBe(crc32Table);
});

test('getCrcTable throws for invalid variant', () => {
  expect(() => getCrcTable('invalid')).toThrow('Invalid variant [invalid]');
});

test('CRC32 table has expected first values', () => {
  const table = getCrcTable(CRC32);
  
  expect(table[0]).toBe(0);
  expect(table[1]).toBe(0x77073096);
  expect(table[2] >>> 0).toBe(0xEE0E612C); // Use unsigned comparison
});

test('CRC32C table has expected first values', () => {
  const table = getCrcTable(CRC32C);
  
  expect(table[0]).toBe(0);
  expect(table[1] >>> 0).toBe(0xF26B8303); // Use unsigned comparison
  expect(table[2] >>> 0).toBe(0xE13B70F7); // Use unsigned comparison
});