/**
 * Custom block-based CRC32 calculation
 *
 * Splits large buffers into blocks and concatenates individual CRC32 values.
 * Creates proprietary checksum format for efficient large file processing.
 */

import { base58fromNumber } from '$lib/util/bases.js';

import { bufferToCrc32 } from './bufferCrc32.js';
import { CRC32 } from './crcTables.js';

/* ---------------------------------------------------------------- Constants */

/** @type {number} */
const MIN_BUFFER_BLOCK_SIZE = 100000;

/** @type {number} */
const MAX_BUFFER_BLOCKS = 20;

/** @type {number} */
const OPTIMAL_BLOCK_SIZE_FACTOR = 0.95;

/* ---------------------------------------------------------------- Functions */

/**
 * Calculate block-based CRC32 for buffer
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to process
 * @param {number} [blockSize] - Block size (auto-calculated if not provided)
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 *
 * @returns {object} Block checksum result
 */
export function bufferToBlockCrc32(buffer, blockSize, variant = CRC32) {
  if (!blockSize) {
    blockSize = optimalBlockSize(buffer);
  }

  /** @type {number[]} */
  const checksumList = [];

  for (const block of blockCrc32Iterator(buffer, blockSize, variant)) {
    checksumList.push(block.value);
  }

  return {
    checksumList,
    blockSize,
    toBase58: () => checksumsToBase58(checksumList)
  };
}

/**
 * Iterate over buffer blocks and yield CRC32 for each
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to process
 * @param {number} [blockSize] - Block size
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 *
 * @yields {object} Block checksum with value and encoding methods
 */
export function* blockCrc32Iterator(buffer, blockSize, variant = CRC32) {
  if (!blockSize) {
    blockSize = optimalBlockSize(buffer);
  }

  const bufferLength = getBufferLength(buffer);

  for (let offset = 0; offset < bufferLength; offset += blockSize) {
    const currentBlockSize = Math.min(blockSize, bufferLength - offset);
    
    /** @type {number} */
    const value = bufferToCrc32(buffer, offset, currentBlockSize, variant);

    yield {
      value,
      offset,
      size: currentBlockSize,
      toBase58: () => base58fromNumber(value)
    };
  }
}

/**
 * Check if buffer checksum matches expected value
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to verify
 * @param {string} expectedChecksum - Expected Base58 checksum string
 * @param {number} [blockSize] - Block size
 * @param {import('./crcTables.js').CrcVariant} [variant=CRC32] - CRC variant
 *
 * @returns {boolean} True if checksums match
 */
export function bufferChecksumEquals(
  buffer, 
  expectedChecksum, 
  blockSize, 
  variant = CRC32
) {
  if (!blockSize) {
    blockSize = optimalBlockSize(buffer);
  }

  /** @type {string} */
  let remaining = expectedChecksum;

  for (const block of blockCrc32Iterator(buffer, blockSize, variant)) {
    const blockChecksum = block.toBase58();

    if (!remaining.startsWith(blockChecksum)) {
      return false;
    }

    remaining = remaining.slice(blockChecksum.length);
  }

  return remaining.length === 0;
}

/**
 * Calculate optimal block size for buffer
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to analyze
 *
 * @returns {number} Optimal block size
 */
export function optimalBlockSize(buffer) {
  /** @type {number} */
  const bufferByteLength = getBufferLength(buffer);

  if (bufferByteLength < MIN_BUFFER_BLOCK_SIZE) {
    return bufferByteLength;
  }

  /** @type {number} */
  let blockSize = bufferByteLength / MAX_BUFFER_BLOCKS;

  if (blockSize < MIN_BUFFER_BLOCK_SIZE) {
    return MIN_BUFFER_BLOCK_SIZE;
  }

  return Math.ceil(
    blockSize * OPTIMAL_BLOCK_SIZE_FACTOR + 
    MIN_BUFFER_BLOCK_SIZE * (1 - OPTIMAL_BLOCK_SIZE_FACTOR)
  );
}

/* ------------------------------------------------------- Internal functions */

/**
 * Get buffer length safely for different buffer types
 *
 * @param {ArrayBuffer|DataView|Uint8Array} buffer - Buffer to measure
 *
 * @returns {number} Buffer length in bytes
 */
function getBufferLength(buffer) {
  if (buffer instanceof ArrayBuffer || buffer instanceof DataView) {
    return buffer.byteLength;
  }
  return buffer.length;
}

/**
 * Convert checksum array to concatenated Base58 string
 *
 * @param {number[]} checksumList - Array of CRC32 values
 *
 * @returns {string} Concatenated Base58 string
 */
function checksumsToBase58(checksumList) {
  return checksumList.map(crc => base58fromNumber(crc)).join('');
}
