/**
 * bytes.js
 *
 * @description
 * Cross-platform random byte generation utilities using Web Crypto API
 */

import * as expect from '../expect.js';

/**
 * Generate cryptographically secure random bytes
 * - Uses Web Crypto API (works in Node.js 16+ and all modern browsers)
 * - Returns Uint8Array for maximum compatibility
 *
 * @param {number} length - Number of bytes to generate
 *
 * @returns {Uint8Array} Random bytes
 */
export function randomBytes(length) {
  expect.positiveNumber(length);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Modern browsers + Node.js 16+
    return crypto.getRandomValues(new Uint8Array(length));
  } else if (typeof require !== 'undefined') {
    // Fallback for older Node.js environments
    try {
      const { randomBytes: nodeRandomBytes } = require('crypto');
      return new Uint8Array(nodeRandomBytes(length));
    } catch (error) {
      throw new Error('No secure random generator available');
    }
  } else {
    throw new Error('No secure random generator available');
  }
}

/**
 * Generate random bytes and return as base64 string
 * - Cross-platform base64 encoding
 *
 * @param {number} length - Number of bytes to generate
 *
 * @returns {string} Base64 encoded random bytes
 */
export function randomBytesBase64(length) {
  const bytes = randomBytes(length);

  // Convert to base64 using available method
  if (typeof Buffer !== 'undefined') {
    // Node.js - most efficient
    return Buffer.from(bytes).toString('base64');
  } else {
    // Browser - use btoa
    return btoa(String.fromCharCode(...bytes));
  }
}

/**
 * Generate random bytes and return as hex string
 * - Cross-platform hex encoding
 *
 * @param {number} length - Number of bytes to generate
 *
 * @returns {string} Hex encoded random bytes
 */
export function randomBytesHex(length) {
  const bytes = randomBytes(length);
  
  // Convert to hex string
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}