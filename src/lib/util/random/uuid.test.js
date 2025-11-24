/**
 * Unit tests for UUID generation
 *
 * @description
 * Tests for cross-platform UUID v4 generation
 */

import { describe, it, expect } from 'vitest';

import { randomUUID } from '$lib/util/random';

describe('randomUUID', () => {
  it('should generate a valid UUID string', () => {
    const uuid = randomUUID();

    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBe(36); // UUID v4 format: 8-4-4-4-12
  });

  it('should match UUID v4 format', () => {
    const uuid = randomUUID();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where x is any hex digit and y is one of 8, 9, a, or b
    const uuidV4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    expect(uuidV4Regex.test(uuid)).toBe(true);
  });

  it('should generate unique UUIDs on consecutive calls', () => {
    const uuid1 = randomUUID();
    const uuid2 = randomUUID();
    const uuid3 = randomUUID();

    expect(uuid1).not.toBe(uuid2);
    expect(uuid2).not.toBe(uuid3);
    expect(uuid1).not.toBe(uuid3);
  });

  it('should have version 4 indicator', () => {
    const uuid = randomUUID();
    const versionChar = uuid.charAt(14); // Position of version digit

    expect(versionChar).toBe('4');
  });

  it('should have correct variant bits', () => {
    const uuid = randomUUID();
    const variantChar = uuid.charAt(19); // Position of variant digit

    // Variant should be 8, 9, a, or b (binary 10xx)
    expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
  });

  it('should generate many unique UUIDs', () => {
    const uuids = new Set();
    const count = 1000;

    for (let i = 0; i < count; i++) {
      uuids.add(randomUUID());
    }

    // All should be unique
    expect(uuids.size).toBe(count);
  });

  it('should use lowercase hex characters', () => {
    const uuid = randomUUID();

    // Remove dashes and check all characters are lowercase hex
    const hexOnly = uuid.replace(/-/g, '');
    expect(/^[0-9a-f]+$/.test(hexOnly)).toBe(true);
  });

  it('should have correct structure with dashes', () => {
    const uuid = randomUUID();
    const parts = uuid.split('-');

    expect(parts.length).toBe(5);
    expect(parts[0].length).toBe(8);
    expect(parts[1].length).toBe(4);
    expect(parts[2].length).toBe(4);
    expect(parts[3].length).toBe(4);
    expect(parts[4].length).toBe(12);
  });

  it('should have good entropy', () => {
    // Generate UUIDs and check they use different hex digits
    const uuid = randomUUID();
    const hexOnly = uuid.replace(/-/g, '');
    const uniqueDigits = new Set(hexOnly);

    // Should have at least 8 different hex digits in a UUID
    expect(uniqueDigits.size).toBeGreaterThanOrEqual(8);
  });
});
