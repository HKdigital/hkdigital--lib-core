/**
 * JWT utility functions
 *
 * @description
 * This module provides utility functions for JWT operations including 
 * sign, verify and error casting.
 */

import jwt from 'jsonwebtoken';

import {
  TokenExpiredError as JwtTokenExpiredError,
  JsonWebTokenError as JwtJsonWebTokenError,
  NotBeforeError as JwtNotBeforeError
} from 'jsonwebtoken';

import * as expect from '$lib/util/expect.js';

import {
  JWT_DEFAULT_EXPIRES_IN,
  DEFAULT_ALGORITHM,
  VERIFY_OPTIONS 
} from './constants.js';

import {
  TokenExpiredError,
  JsonWebTokenError,
  InvalidSignatureError,
  NotBeforeError
} from './errors.js';

/**
 * Create a JSON Web Token (JWT)
 * - Stringifies the claims as JSON object
 * - Encodes the options
 * - Calculates a Message Authentication Code (MAC)
 *   (by default a Hash Based Authentication Code (HMAC) will be used: HS512)
 * - Combines the parts into a JWT string
 *
 * @param {import('./typedef.js').JwtPayload} claims - JWT payload/claims
 * @param {import('./typedef.js').Secret} secretOrPrivateKey
 *   Secret or private key that is used by the MAC calculation algorithm
 *
 *   - To generate a secret for a Hash based Authentication Code (HMAC):
 *     use a function like `generateSecretKeyForHmacBase58()`.
 *
 *   - For algorithms that use asymmetric keys, the secret is the private key
 *     of the key pair.
 *
 * @param {import('./typedef.js').SignOptions} [options] - JWT signing options
 *
 * For more options:
 * @see https://github.com/auth0/node-jsonwebtoken
 *
 * @returns {string} JsonWebToken
 */
export function sign(
  claims,
  secretOrPrivateKey,
  options={} )
{
  expect.object( claims );
  expect.defined( secretOrPrivateKey );

  if( options )
  {
    expect.object( options );
  }
  else {
    options = {};
  }

  if( !('algorithm' in options) )
  {
    options.algorithm = DEFAULT_ALGORITHM;
  }

  if( !('expiresIn' in options) )
  {
    options.expiresIn = JWT_DEFAULT_EXPIRES_IN;
  }
  else if( !options.expiresIn )
  {
    delete options.expiresIn;
  }

  // @ts-ignore
  return jwt.sign( claims, secretOrPrivateKey, options );
}

/**
 * Decode and verify a JWT token
 * - Forces the use of the algorithm specified in VERIFY_OPTIONS
 *
 * @param {string} token - A JWT token
 * @param {import('./typedef.js').Secret} secretOrPrivateKey
 *   The secret of private key to be used for decoding
 * @param {import('./typedef.js').VerifyOptions} [options=VERIFY_OPTIONS] - verify / decode options
 *
 * @returns {import('./typedef.js').JwtPayload} claims - The decoded JWT payload
 */
export function verify( token, secretOrPrivateKey, options=VERIFY_OPTIONS )
{
  expect.notEmptyString( token );
  expect.defined( secretOrPrivateKey );

  if( !('algorithms' in options) )
  {
    options.algorithms = VERIFY_OPTIONS.algorithms;
  }

  try {
    // @ts-ignore
    const decoded = jwt.verify( token, secretOrPrivateKey, options );

    return decoded;
  }
  catch( e )
  {
    //
    // Cast internal jsonwebtoken errors to Error types defined in this lib
    //
    throw castJwtError(e);
  }
}

// Internals

/**
 * Casts jsonwebtoken library errors to internal error types
 * @param {Error} error - The original jsonwebtoken error
 * @returns {Error} - The corresponding internal error
 */
export function castJwtError(error) {
  if (error instanceof JwtTokenExpiredError) {
    return new TokenExpiredError(error.message, error.expiredAt, error);
  }
  
  if (error instanceof JwtNotBeforeError) {
    return new NotBeforeError(error.message, error.date, error);
  }
  
  if (error instanceof JwtJsonWebTokenError) {
    if (error.message === 'invalid signature') {
      return new InvalidSignatureError(error.message, error, error);
    }
    return new JsonWebTokenError(error.message, error, error);
  }
  
  // Return original error if not a known JWT error
  return error;
}
