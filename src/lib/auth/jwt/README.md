# JWT Utilities

A comprehensive JSON Web Token (JWT) library for signing, verifying, and 
decoding JWT tokens with proper error handling and type safety.

## Features

- **Sign tokens** with customizable algorithms and expiration
- **Verify tokens** with signature validation and expiration checks
- **Decode payloads** without verification for inspection purposes
- **Generate secret keys** for HMAC algorithms
- **Error handling** with specific error types for different failure modes
- **Type safety** with JSDoc type annotations

## Quick Start

```javascript
import { sign, verify, decodePayload, expiresAtUTC } from '$lib/auth/jwt.js';

// Create a token
const payload = { userId: 123, username: 'john' };
const secret = 'your-secret-key';
const token = sign(payload, secret);

// Verify and decode
const decoded = verify(token, secret);
console.log(decoded.userId); // 123

// Decode without verification (for inspection)
const payload = decodePayload(token);
console.log(payload.exp); // expiration timestamp

// Get human-readable expiration
const expiresAt = expiresAtUTC(payload);
console.log(expiresAt); // "Sun, 01 Jan 2023 00:00:00 GMT"
```

## API Reference

### sign(claims, secretOrPrivateKey, options?)

Creates a JSON Web Token with the specified claims.

**Parameters:**
- `claims` (object) - JWT payload/claims
- `secretOrPrivateKey` (string|Buffer) - Secret for HMAC or private key
- `options` (object, optional) - Signing options

**Options:**
- `algorithm` (string) - Algorithm to use (default: 'HS512')
- `expiresIn` (string|number) - Token expiration (default: '24h')
- `issuer` (string) - Token issuer
- `audience` (string) - Token audience
- `subject` (string) - Token subject

**Returns:** `string` - JWT token

**Example:**
```javascript
const token = sign(
  { userId: 123, role: 'admin' },
  'secret-key',
  { 
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: 'my-app'
  }
);
```

### verify(token, secretOrPrivateKey, options?)

Verifies and decodes a JWT token.

**Parameters:**
- `token` (string) - JWT token to verify
- `secretOrPrivateKey` (string|Buffer) - Secret for HMAC or public key
- `options` (object, optional) - Verification options

**Options:**
- `algorithms` (string[]) - Allowed algorithms (default: ['HS512'])
- `issuer` (string) - Expected issuer
- `audience` (string) - Expected audience
- `ignoreExpiration` (boolean) - Skip expiration validation

**Returns:** `object` - Decoded JWT payload

**Throws:**
- `TokenExpiredError` - Token has expired
- `InvalidSignatureError` - Invalid signature
- `JsonWebTokenError` - Other JWT validation errors
- `NotBeforeError` - Token not yet valid

**Example:**
```javascript
try {
  const decoded = verify(token, 'secret-key');
  console.log('User ID:', decoded.userId);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    console.log('Token expired at:', error.expiredAt);
  }
}
```

### decodePayload(token)

Decodes JWT payload without verification. Useful for inspecting token claims
before verification or when verification is not required.

**Parameters:**
- `token` (string) - JWT token to decode

**Returns:** `object` - Decoded JWT payload

**Throws:**
- `Error` - Invalid token format or malformed payload

**Example:**
```javascript
// Inspect token without verification
const payload = decodePayload(token);
console.log('Token expires:', payload.exp);
console.log('Issued at:', payload.iat);

// Check if token is expired before verification
if (payload.exp && payload.exp < Date.now() / 1000) {
  console.log('Token is expired');
}
```

### expiresAtUTC(token)

Converts the `exp` claim of a decoded token to a human-readable UTC string.

**Parameters:**
- `token` (object) - Decoded JWT payload with optional `exp` claim

**Returns:** `string|null` - UTC string or null if no expiration

**Example:**
```javascript
const payload = decodePayload(token);
const expiresAt = expiresAtUTC(payload);

if (expiresAt) {
  console.log('Token expires at:', expiresAt);
  // "Sun, 01 Jan 2023 00:00:00 GMT"
} else {
  console.log('Token never expires');
}
```

## Error Types

The library provides specific error types for different failure modes:

### TokenExpiredError
Thrown when a token has expired.
- `message` - Error description
- `expiredAt` - Date when token expired

### InvalidSignatureError  
Thrown when token signature is invalid.
- `message` - Error description

### JsonWebTokenError
Thrown for general JWT validation errors.
- `message` - Error description

### NotBeforeError
Thrown when token is not yet valid (nbf claim).
- `message` - Error description
- `date` - Date when token becomes valid

## Security Best Practices

### Secret Key Management
- Use cryptographically strong secrets (256+ bits for HMAC)
- Store secrets securely (environment variables, key management services)
- Rotate secrets regularly
- Never commit secrets to version control

```javascript
import { generateSecretKeyForHmacBase58 } from '$lib/auth/jwt.js';

// Generate a secure secret
const secret = generateSecretKeyForHmacBase58();
```

### Token Validation
- Always verify tokens before trusting claims
- Use specific algorithm allowlists in verification
- Validate issuer, audience, and other claims as needed
- Handle expiration appropriately for your use case

```javascript
const decoded = verify(token, secret, {
  algorithms: ['HS256'], // Only allow specific algorithms
  issuer: 'trusted-issuer',
  audience: 'my-app'
});
```

### Token Storage
- Store tokens securely (httpOnly cookies, secure storage)
- Use short expiration times when possible
- Implement token refresh mechanisms
- Clear tokens on logout

## Common Patterns

### Token Inspection Middleware
```javascript
function inspectToken(token) {
  try {
    const payload = decodePayload(token);
    const expiresAt = expiresAtUTC(payload);
    
    return {
      isExpired: payload.exp && payload.exp < Date.now() / 1000,
      expiresAt,
      userId: payload.userId,
      role: payload.role
    };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}
```

### Token Refresh Check
```javascript
function shouldRefreshToken(token) {
  const payload = decodePayload(token);
  if (!payload.exp) return false;
  
  const now = Date.now() / 1000;
  const timeUntilExpiry = payload.exp - now;
  const refreshThreshold = 5 * 60; // 5 minutes
  
  return timeUntilExpiry < refreshThreshold && timeUntilExpiry > 0;
}
```

### Safe Token Verification
```javascript
function safeVerifyToken(token, secret) {
  try {
    return { success: true, payload: verify(token, secret) };
  } catch (error) {
    return { 
      success: false, 
      error: error.constructor.name,
      message: error.message 
    };
  }
}
```

## Testing

Run the JWT tests:

```bash
pnpm test:file src/lib/auth/jwt/
```

The test suite covers:
- Token signing with various options
- Token verification with different scenarios
- Error handling for expired/invalid tokens
- Payload decoding without verification
- UTC time conversion
- Edge cases and error conditions