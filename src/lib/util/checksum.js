/**
 * Checksum utilities - CRC32 calculations
 *
 * Exports the main public-facing functions from the checksum module.
 * Provides both standard IEEE 802.3 CRC32 and custom block-based processing.
 */

// String CRC32 calculations
export { stringToCrc32, CRC32, CRC32C } from './checksum/stringCrc32.js';

// Standard buffer CRC32 (IEEE 802.3 compatible)
export { bufferToCrc32 } from './checksum/bufferCrc32.js';

// Custom block-based CRC32 for large files
export {
  bufferToBlockCrc32,
  blockCrc32Iterator,
  bufferChecksumEquals,
  optimalBlockSize
} from './checksum/blockCrc32.js';

// CRC table utilities (for advanced use)
export { getCrcTable } from './checksum/crcTables.js';