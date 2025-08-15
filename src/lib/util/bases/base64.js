/**
 * base64.js
 *
 * @description
 * This file contains utilities for working with base64 encoding/decoding
 */

import * as expect from '../expect.js';

/**
 * Decode a base64 encoded string into a Uint8Array
 *
 * @param {string} str64 - Base64 encoded string
 *
 * @returns {Uint8Array} byte array that contains the decoded contents
 */
export function base64ToUint8Array( str64 )
{
  expect.string( str64 );
  
  const binaryString = atob(str64);
  return Uint8Array.from(binaryString, char => char.charCodeAt(0));
}
