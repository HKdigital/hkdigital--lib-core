/**
 * JWT type definitions
 *
 * @description
 * Type definitions for JWT operations, based on jsonwebtoken library types.
 */

/**
 * Standard JWT claims (RFC 7519)
 * @typedef {Object} JwtStandardClaims
 * @property {string} [iss] - Issuer
 * @property {string} [sub] - Subject  
 * @property {string|string[]} [aud] - Audience
 * @property {number} [exp] - Expiration time (seconds since epoch)
 * @property {number} [nbf] - Not before (seconds since epoch)
 * @property {number} [iat] - Issued at (seconds since epoch)
 * @property {string} [jti] - JWT ID
 */

/**
 * JWT payload - standard claims plus any custom data
 * @typedef {JwtStandardClaims & Record<string, any>} JwtPayload
 */

/**
 * JWT signing options
 * @typedef {Object} SignOptions
 * @property {string} [algorithm] - Signing algorithm (HS256, RS256, etc.)
 * @property {string|number} [expiresIn] - Expiration time ('1h', 3600, etc.)
 * @property {string|number} [notBefore] - Not valid before time
 * @property {string|string[]} [audience] - Audience claim
 * @property {string} [issuer] - Issuer claim
 * @property {string} [jwtid] - JWT ID claim
 * @property {string} [subject] - Subject claim
 * @property {boolean} [noTimestamp] - Skip iat claim
 * @property {Object} [header] - Additional header claims
 * @property {string} [keyid] - Key ID header claim
 * @property {boolean} [mutatePayload] - Modify payload object directly
 */

/**
 * JWT verification options
 * @typedef {Object} VerifyOptions
 * @property {string[]} [algorithms] - Allowed algorithms
 * @property {string|string[]} [audience] - Expected audience
 * @property {boolean} [complete] - Return object with payload and header
 * @property {string} [issuer] - Expected issuer
 * @property {boolean} [ignoreExpiration] - Skip expiration validation
 * @property {boolean} [ignoreNotBefore] - Skip notBefore validation
 * @property {string} [subject] - Expected subject
 * @property {number} [clockTolerance] - Clock tolerance in seconds
 * @property {number} [maxAge] - Maximum token age in seconds
 * @property {number} [clockTimestamp] - Current time override (seconds)
 * @property {string} [nonce] - Expected nonce claim
 */

/**
 * JWT secret types
 * @typedef {string|Buffer|{key: string|Buffer, passphrase: string}} Secret
 */


/**
 * Decoded JWT result
 * @typedef {Object} JwtDecoded
 * @property {JwtPayload} payload - The decoded payload
 * @property {Object} header - The decoded header
 * @property {string} signature - The signature
 */

// Export types for use in JSDoc
export {};
