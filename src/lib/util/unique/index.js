/**
 * unique.js
 *
 * @description
 * This file contains functionality to generate unique data
 *
 * @example
 *
 *   import { generateLocalId } from './unique.js';
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
 *   instanceId?: string,
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
 * Get or generate an id that can be used to identify a client or server instance
 * - Output format: <length-prefix><base58-time-based><random-chars>
 * - Length prefix is the base58 encoded length of the time-based component
 * - Higher entropy than the old serverId for global uniqueness
 * - The ID is generated only once per session/boot and cached
 *
 * @param {number} [randomSize=16] - Number of random base58 characters
 * @param {boolean} [reset=false] - Reset the previously generated id
 *
 * @returns {string} instance id
 */
export function generateOrGetInstanceId(randomSize = 16, reset = false) {
  if (!vars.instanceId || reset) {
    const timeBasedPart = getTimeBasedNumber30sBase58(); // max 6 chars
    const lengthPrefix = base58fromNumber(timeBasedPart.length); // 1 char

    vars.instanceId =
      lengthPrefix +
      timeBasedPart +
      randomStringBase58(randomSize);
  }

  return vars.instanceId;
}

/**
 * Generates and returns a new unique global id
 * - The generated id is guaranteed to be globally unique across different
 *   clients/servers/systems
 * - Format: <length-prefix><instance-id><local-id>
 * - Length prefix is the base58 encoded length of the instance ID + local ID
 * - Optimized for high-frequency generation (thousands per second)
 * - Instance ID provides ~94 bits of entropy (16 random base58 chars)
 * - Local ID uses efficient counter mechanism for same-window uniqueness
 *
 * @param {number} [timeMs]
 *   Custom time value to be used instead of Date.now()
 *
 * @returns {string}
 *   Global id (max 39 chars: 1 length prefix + 23 instance + 15 local)
 */
export function generateGlobalId(timeMs) {
  const instanceId = generateOrGetInstanceId();  // max 1 + 6 + 16 = 23 chars
  const localId = generateLocalId(timeMs);       // max 15 chars

  // Max 1 char (23 + 15 = 38)
  const lengthPrefix = base58fromNumber(instanceId.length + localId.length);

  // Max 39 chars (1 + 23 + 15 = 39)
  return lengthPrefix + instanceId + localId;
}

/**
 * Generates and returns a new unique local id
 * - The generated id is guaranteed to be unique on the currently running
 *   local system
 * - Format: <boot-prefix><length-indicator><time-based><count-based>
 * - Boot prefix provides uniqueness across process restarts
 * - Time-based component changes every 30 seconds
 * - Counter resets every 30 seconds (656M IDs per 30s window = 5 chars)
 * - Optimized for high-frequency generation (thousands per second)
 *
 * @param {number} [timeMs]
 *   Custom time value to be used instead of Date.now()
 *
 * @returns {string}
 *   Local id (max 15 chars: 3 boot prefix + 1 length + 6 time + 5 count)
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
      (vars.lastCountBasedNumber ?? 0) + 1;

    // -- Use cached lastTimeBasedNumber

    timeBasedValue58 = vars.lastTimeBasedValue58;
  }

  const countBasedValue58 = base58fromNumber(countBasedNumber);

  // Combine parts into single identifier string
  //
  // @note ALPHABET_BASE_58 is used because it is faster than
  //       base58fromNumber for single character encoding

  //
  // bootTimePrefix => 3 chars
  // ALPHABET_BASE_58[timeBasedValue58.length] => 1 char
  // timeBasedValue58 => max 6 chars
  // countBasedValue58 => max 5 chars
  // (resets every 30 seconds => 58^5 = 656.356.768)
  //
  // Realistic max length: 3 + 1 + 6 + 5 = 15 chars
  //
  const id =
    // idFormatPrefix
    bootTimePrefix() +
    // @ts-ignore
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
 * Returns a time based base58 encoded string that changes every 30 seconds
 *
 * - Output length grows over time as the number increases
 * - Starting from TIME_2025_01_01 (January 1, 2025)
 * - After 1 month: ~3 characters
 * - After 1 year: ~4 characters
 * - After 5 years: ~4 characters
 * - After 10 years: ~5 characters
 * - After 100 years: ~6 characters
 *
 * @param {number} [timeMs=sinceMs()]
 *   Custom time value to be used instead of sinceMs()
 *
 * @returns {string} base58 encoded time based value
 */
export function getTimeBasedNumber30sBase58(timeMs) {
  return base58fromNumber(getTimeBasedNumber30s(timeMs));
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
