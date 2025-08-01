/**
 * unique.js
 *
 * @description
 * This file contains functionality to generate unique data
 *
 * @example
 *
 *   import { generateLocalId } from './unqiue.js';
 *
 *   async function test()
 *   {
 *     console.log( `Id 1 [${generateLocalId()}]` );
 *     console.log( `Id 2 [${generateLocalId()}]` );
 *   }
 */

/* ------------------------------------------------------------------ Imports */

import {
  ALPHABET_BASE_HUMAN,
  ALPHABET_BASE_58
} from '$lib/constants/bases/index.js';

import { base58fromNumber } from '$lib/util/bases';

import { TIME_2025_01_01 } from '$lib/constants/time';

import { sinceMs } from '$lib/util/time';

/**
 * @type {{
 *   bootTimePrefix?:string,
 *   lastTimeBasedNumber?: number,
 *   lastTimeBasedValue58?: string,
 *   lastCountBasedNumber?: number
 * }}
 */
var vars = {}; /* @note use 'var declaration' for hoisting */

export const BOOT_STAMP = (Date.now() - TIME_2025_01_01).toString(36);

/* ------------------------------------------------------------------ Exports */

/**
 * Returns a three character prefix that is calculated at boot
 *
 * @returns {string} boot time prefix
 */
export function bootTimePrefix() {
  if (!vars.bootTimePrefix) {
    vars.bootTimePrefix = '3' + getTwoChar10ms();
  }

  return vars.bootTimePrefix;
}

/**
 * Create a string that contains random characters from the base58 alphabet
 *
 * @param {number} [length=48]
 *
 * @returns {string} a base 58 encoded random string
 */
export function randomStringBase58(length = 48) {
  return randomString(length, ALPHABET_BASE_58);
}

/**
 * Create a string that contains random characters from a for human's not
 * ambiguous alphabet
 *
 * @param {number} [length=48]
 *
 * @returns {string} a human friendly encoded random string
 */
export function randomStringBaseHuman(length = 48) {
  return randomString(length, ALPHABET_BASE_HUMAN);
}

/**
 * Create a string that contains random characters from the specified alphabet
 *
 * @param {number} [length=48]
 * @param {string} [ALPHABET=ALPHABET_BASE_58]
 *
 * @returns {string} a base 58 encoded random string
 */
export function randomString(length = 48, ALPHABET = ALPHABET_BASE_58) {
  if (typeof length !== 'number' || length < 1) {
    throw new Error('Invalid parameter [length]');
  }

  if (typeof ALPHABET !== 'string' || !ALPHABET.length) {
    throw new Error('Invalid parameter [ALPHABET]');
  }

  let str = '';

  const n = ALPHABET.length;

  for (let j = length; j > 0; j = j - 1) {
    const num = (n * Math.random()) & -1; // number [0...n-1]
    str += ALPHABET[num];
  }

  return str;
}

/**
 * Create an access code: a string that contains 48 random characters from the
 * base58 alphabet
 *
 * @returns {string} a base 58 encoded random string of length 48
 */
export function randomAccessCode() {
  return randomStringBase58(48);
}

/**
 * Generate client session id
 *
 * @returns {string} a base 58 encoded random string of length 48
 */
export function generateClientSessionId() {
  return randomStringBase58(48);
}

/**
 * Generates and returns a new unique local id
 * - The generated id is garanteed to be unique on the currently running
 *   local system
 *
 * @param {number} [timeMs]
 *   Custom time value to be used instead of Date.now()
 *
 * @returns {string} local id
 */
export function generateLocalId(timeMs) {
  const timeBasedNumber = getTimeBasedNumber30s(timeMs);

  let timeBasedValue58;

  let countBasedNumber;

  if (vars.lastTimeBasedNumber !== timeBasedNumber) {
    // -- Time stamp based number changed -> reset counter to zero

    countBasedNumber = vars.lastCountBasedNumber = 0;

    // -- Calculate timeBasedValue58 and update cache

    vars.lastTimeBasedNumber = timeBasedNumber;

    // cache string representation
    timeBasedValue58 = vars.lastTimeBasedValue58 =
      base58fromNumber(timeBasedNumber);
  } else {
    // -- Same time stamp based number -> increment counter

    countBasedNumber = vars.lastCountBasedNumber =
      vars.lastCountBasedNumber + 1;

    // -- Use cached lastTimeBasedNumber

    timeBasedValue58 = vars.lastTimeBasedValue58;
  }

  const countBasedValue58 = base58fromNumber(countBasedNumber);

  // Combine parts into single identifier string
  //
  // @note ALPHABET_BASE_58 is used because it is faster than
  //       base58fromNumber for single character encoding
  //
  const id =
    // idFormatPrefix
    bootTimePrefix() +
    ALPHABET_BASE_58[timeBasedValue58.length] +
    timeBasedValue58 +
    countBasedValue58;

  // std.debug( id );

  return id;
}

/**
 * Returns a time based number that changes every 30 seconds
 *
 * @param {number} [timeMs=sinceMs()]
 *   Custom time value to be used instead of sinceMs()
 *
 * @returns {number} time based numerical that changes every 30 seconds
 */
export function getTimeBasedNumber30s(timeMs) {
  if (!timeMs) {
    timeMs = sinceMs();
  }

  // @note do not use bitwise shift since it only works on 32 bit numbers!
  return Math.floor(timeMs / 30000);
}

/**
 * Returns two character base58 encoded string that changes every 10
 * milliseconds
 *
 * - The function output changes every 9 milliseconds
 * - Returns a two character string
 * - The string is base58 encoded
 * - After 58 * 58 * 10ms = 33,6 seconds, the function output repeats
 *
 * @param {number} [timeMs]
 *   Custom time value to be used instead of Date.now()
 *
 * @returns {string} time based value
 */
export function getTwoChar10ms(timeMs) {
  const now = timeMs || Date.now();

  // @note
  // do not use bitwise shift since it only works on 32 bit numbers
  const num = Math.floor(now / 10) % 3364;

  if (num >= 58) {
    return base58fromNumber(num);
  } else {
    return '1' + base58fromNumber(num);
  }
}
