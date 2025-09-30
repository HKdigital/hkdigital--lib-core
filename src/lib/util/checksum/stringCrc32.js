/**
 * String CRC32 calculation utility
 *
 * Calculates CRC32 checksums for strings using standard IEEE 802.3 algorithm.
 * CRC32 is fast but not cryptographically secure.
 */

import { getCrcTable, CRC32, CRC32C } from './crcTables.js';

/* ------------------------------------------------------------------ Exports */

export { CRC32, CRC32C };

/**
 * Calculate CRC32 hash for string input
 *
 * @param {string} str - String to calculate checksum for
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 *
 * @returns {number} Unsigned 32-bit CRC32 value
 */
export function stringToCrc32(str, variant = CRC32) {
  const table = getCrcTable(variant);

  /** @type {number} */
  let crc = 0 ^ (-1);

  for (let j = 0; j < str.length; j = j + 1) {
    crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(j)) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
}
