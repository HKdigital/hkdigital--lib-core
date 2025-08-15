/**
 * JWT secret key generation utilities
 *
 * @description
 * This module provides utilities for generating cryptographically secure
 * secret keys for JWT signing and verification.
 */

import { base58fromNumber, bytesToNumber } from '$lib/util/bases.js';
import { randomBytes, randomBytesBase64 } from '$lib/util/random.js';

/**
 * Generate a secret key with the specified number of bytes
 * - The default length is 64 bytes, which is 512 bits, which is a nice secret
 *   key length for the HS512 algorithm
 *
 * @returns {string} a base64 encoded secret key string
 */
export function generateSecretKeyBase64( numberOfBytes=64 )
{
  return randomBytesBase64( numberOfBytes );
}

/**
 * Create a string that can be used as secret key for HMAC
 * - An HMAC is an Hash based Message Authentication Code
 *
 * - The formula for calculating a HMAC is:
 *
 *   HMAC = hashFunc(secret key + message)
 *
 * - This function generates a long random secret
 *
 * - The secret key is quite long because long keys are more likely to
 *   resistent brute force attacks
 *
 * - The returned secret is a base58 encoded string
 *
 * @note The standard javascript random generator is used. For more secure
 *       secret keys consider using crypto
 *
 * @returns {string} generated secret, formatted as base 58 string
 */
export function generateSecretKeyForHmacBase58()
{
  const numberOfBytes = 64;

  const bytes = randomBytes( numberOfBytes );

  const numericValue = bytesToNumber( bytes );

  return base58fromNumber( numericValue );
}
