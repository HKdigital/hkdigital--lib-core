/**
 * Core JWT operations - sign and verify functions
 *
 * @description
 * This module provides the main JWT functionality for signing and verifying tokens.
 * It wraps the jsonwebtoken library with consistent error handling and validation.
 */

import jwt from 'jsonwebtoken';

import * as expect from '$lib/util/expect.js';

import { 
  JWT_DEFAULT_EXPIRES_IN,
  DEFAULT_ALGORITHM,
  VERIFY_OPTIONS 
} from './constants.js';

import {
  TokenExpiredError,
  JsonWebTokenError,
  InvalidSignatureError
} from './errors.js';

/**
 * Create a JSON Web Token (JWT)
 * - Stringifies the claims as JSON object
 * - Encodes the options
 * - Calculates a Message Authentication Code (MAC)
 *   (by default a Hash Based Authentication Code (HMAC) will be used: HS512)
 * - Combines the parts into a JWT string
 *
 * @param {object} options.claims
 * @param {string} options.secretOrPrivateKey
 *   Secret or private key that is used by the MAC calculation algorithm
 *
 *   - To generate a secret for a Hash based Authentication Code (HMAC):
 *     use a function like `generateSecretKeyForHmacBase58()`.
 *
 *   - For algorithms that use asymmetric keys, the secret is the private key
 *     of the key pair.
 *
 * @param {object} [options]
 *
 * @param {number|string} [options.expiresIn="30h"]
 *   Number of **seconds** (not milliseconds) or string
 *   (in vercel/ms format) describing the timespan.
 *
 * @param {number|string} [options.algorithm="HS512"]
 *
 * For more options:
 * @see https://github.com/auth0/node-jsonwebtoken
 *
 *   notBefore,
 *   audience,
 *   issuer,
 *   jwtid,
 *   subject,
 *   noTimestamp,
 *   header,
 *   keyid,
 *   mutatePayload=false
 *
 * --
 *
 * @returns {string} JsonWebToken
 */
export function sign(
  {
    claims,
    secretOrPrivateKey
  },
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

  return jwt.sign( claims, secretOrPrivateKey, options );
}

/**
 * Decode and verify a JWT token
 * - Forces the use of the algorithm specified in VERIFY_OPTIONS
 *
 * @param {string} token - A JWT token
 *
 * @param {string} secretOrPrivateKey
 *   The secret of private key to be used for decoding
 *
 * @param {object} [options=VERIFY_OPTIONS] - verify / decode options
 *
 * @returns {object|null} claims or null if the token was not valid
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
    const decoded = jwt.verify( token, secretOrPrivateKey, options );

    return decoded;
  }
  catch( e )
  {
    //
    // rethrow using Error classes defined in this module so users of this
    // function can use instanceof without including `jwt`
    //

    if( e instanceof jwt.TokenExpiredError )
    {
      throw new TokenExpiredError( e.message, { cause: e } );
    }
    else if ( e instanceof jwt.JsonWebTokenError )
    {
      if( e.message === 'invalid signature' )
      {
        throw new InvalidSignatureError( e.message );
      }

      throw new JsonWebTokenError( e.message );
    }

    throw e;
  }
}
