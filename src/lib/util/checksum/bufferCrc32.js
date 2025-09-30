/**
 * Standard buffer CRC32 calculation
 *
 * Implements IEEE 802.3 CRC32 over entire buffer.
 * Compatible with ZIP, PNG, and other standard formats.
 */

import { getCrcTable, CRC32 } from './crcTables.js';

/**
 * Calculate standard CRC32 for buffer
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to checksum
 * @param {number} [byteOffset=0] - Start offset in buffer
 * @param {number} [byteLength] - Number of bytes to process
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 *
 * @returns {number} Unsigned 32-bit CRC32 value
 */
export function bufferToCrc32(buffer, byteOffset = 0, byteLength, variant = CRC32) {
  const table = getCrcTable(variant);
  
  /** @type {DataView} */
  const dataView = createDataView(buffer, byteOffset, byteLength);

  /** @type {number} */
  let crc = 0 ^ (-1);

  for (let j = 0; j < dataView.byteLength; j = j + 1) {
    crc = (crc >>> 8) ^ table[(crc ^ dataView.getUint8(j)) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
}

/* ------------------------------------------------------- Internal functions */

/**
 * Create DataView from various buffer types
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Input buffer
 * @param {number} [byteOffset=0] - Start offset
 * @param {number} [byteLength] - Length to use
 *
 * @returns {DataView} DataView for the buffer
 */
function createDataView(buffer, byteOffset = 0, byteLength) {
  if (buffer instanceof DataView) {
    return new DataView(
      buffer.buffer, 
      buffer.byteOffset + byteOffset,
      byteLength ?? (buffer.byteLength - byteOffset)
    );
  }

  if (buffer instanceof ArrayBuffer) {
    return new DataView(buffer, byteOffset, byteLength);
  }

  if (buffer instanceof Uint8Array) {
    return new DataView(
      buffer.buffer,
      buffer.byteOffset + byteOffset,
      byteLength ?? (buffer.byteLength - byteOffset)
    );
  }

  throw new Error('Unsupported buffer type');
}
