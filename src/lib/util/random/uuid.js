/**
 * uuid.js
 *
 * @description
 * Cross-platform UUID generation utilities using Web Crypto API
 */

/**
 * Generate a cryptographically secure random UUID v4
 * - Uses Web Crypto API (works in Node.js 16+ and all modern browsers)
 * - Returns RFC 4122 compliant UUID v4 string
 * - Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *   where x is any hexadecimal digit and y is one of 8, 9, A, or B
 *
 * @returns {string} UUID v4 string (e.g., "a1b2c3d4-e5f6-4890-abcd-ef1234567890")
 *
 * @example
 * import { randomUUID } from '$lib/util/random/uuid.js';
 *
 * const id = randomUUID();
 * // Returns: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 */
export function randomUUID() {
  // Try native crypto.randomUUID first (most efficient)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    // Modern browsers + Node.js 16.7.0+
    return crypto.randomUUID();
  }

  // Fallback: Manual UUID v4 generation using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Generate 16 random bytes
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    // Set version (4) and variant bits according to RFC 4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    // Convert to UUID string format
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Fallback for older Node.js environments
  if (typeof require !== 'undefined') {
    try {
      const { randomUUID: nodeRandomUUID } = require('crypto');
      return nodeRandomUUID();
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Fall through to error
    }
  }

  throw new Error('No secure random UUID generator available');
}
