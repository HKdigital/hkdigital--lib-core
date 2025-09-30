/**
 * Shared CRC table generation and constants
 */

/**
 * @typedef {import('./typedef').CrcVariant} CrcVariant
 * Valid CRC32 variant types
 */

/**
 * @typedef {import('./typedef').CrcTable} CrcTable
 * Lookup table for CRC calculations - array of 256 numbers
 */

/* ---------------------------------------------------------------- Constants */

/** @type {CrcVariant} */
export const CRC32 = 'crc32';

/** @type {CrcVariant} */
export const CRC32C = 'crc32c';

/** @type {Record<CrcVariant, number>} */
const START_POLYNOMIALS = {
  [CRC32]: 0xEDB88320,
  [CRC32C]: 0x82f63b78
};

/** @type {Record<CrcVariant, CrcTable>} */
// @ts-ignore
const crcTables = {};

/* ---------------------------------------------------------------- Functions */

/**
 * Get CRC lookup table for specified variant
 *
 * @param {CrcVariant} [variant=CRC32] - CRC variant
 *
 * @returns {CrcTable} The CRC lookup table
 */
export function getCrcTable(variant = CRC32) {
  return crcTables[variant] || (crcTables[variant] = makeCRCTable(variant));
}

/* ---------------------------------------------------------------- Internals */

/**
 * Create CRC lookup table for specified variant
 *
 * @param {CrcVariant} variant - CRC variant to create table for
 *
 * @returns {CrcTable} The generated CRC lookup table
 */
function makeCRCTable(variant) {
  /** @type {number} */
  let c;
  
  /** @type {CrcTable} */
  const crcTable = [];

  /** @type {number} */
  const startPolynomial = START_POLYNOMIALS[variant];

  if (!startPolynomial) {
    throw new Error(`Invalid variant [${variant}]`);
  }

  for (let n = 0; n < 256; n = n + 1) {
    c = n;

    for (let k = 0; k < 8; k = k + 1) {
      c = ((c & 1) ? (startPolynomial ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }

  return crcTable;
}
