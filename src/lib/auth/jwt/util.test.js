import { describe, it, expect, beforeAll } from 'vitest';

import { TokenExpiredError as JwtTokenExpiredError,
         JsonWebTokenError as JwtJsonWebTokenError,
         NotBeforeError as JwtNotBeforeError }  from 'jsonwebtoken';

import { castJwtError, sign, verify, decodePayload, expiresAtUTC } from './util.js';

import {
  TokenExpiredError,
  JsonWebTokenError,
  InvalidSignatureError,
  NotBeforeError
} from './errors.js';


describe('sign', () => {
  const secret = 'test-secret-key';
  const payload = { userId: 123, username: 'testuser' };

  it('should create a valid JWT token', () => {
    const token = sign(payload, secret);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should use default algorithm when not specified', () => {
    const token = sign(payload, secret);

    // Token should be verifiable with default algorithm (HS512)
    const decoded = verify(token, secret);
    expect(decoded.userId).toBe(123);
    expect(decoded.username).toBe('testuser');
  });

  it('should use default expiration when not specified', () => {
    const token = sign(payload, secret);
    const decoded = verify(token, secret);

    // Should have an expiration time set
    expect(decoded.exp).toBeDefined();
    expect(typeof decoded.exp).toBe('number');
  });

  it('should accept custom options', () => {
    const customOptions = {
      algorithm: 'HS256',
      expiresIn: '1h',
      issuer: 'test-issuer'
    };

    const token = sign(payload, secret, customOptions);
    const decoded = verify(token, secret, { algorithms: ['HS256'] });

    expect(decoded.userId).toBe(123);
    expect(decoded.iss).toBe('test-issuer');
  });

  it('should handle null expiresIn by removing expiration', () => {
    const options = { expiresIn: null };

    const token = sign(payload, secret, options);
    const decoded = verify(token, secret);

    // Should not have expiration when explicitly set to null
    expect(decoded.exp).toBeUndefined();
  });

  it('should throw error for invalid payload', () => {
    expect(() => sign(null, secret)).toThrow();
    expect(() => sign('invalid', secret)).toThrow();
  });

  it('should throw error for missing secret', () => {
    expect(() => sign(payload, null)).toThrow();
    expect(() => sign(payload, undefined)).toThrow();
  });
});

describe('verify', () => {
  const secret = 'test-secret-key';
  const payload = { userId: 123, username: 'testuser' };
  let validToken;

  beforeAll(() => {
    validToken = sign(payload, secret);
  });

  it('should decode and verify a valid token', () => {
    const decoded = verify(validToken, secret);

    expect(decoded.userId).toBe(123);
    expect(decoded.username).toBe('testuser');
  });

  it('should throw error for invalid token', () => {
    expect(() => verify('invalid.token.format', secret))
      .toThrow(JsonWebTokenError);
  });

  it('should throw error for wrong secret', () => {
    expect(() => verify(validToken, 'wrong-secret'))
      .toThrow(InvalidSignatureError);
  });

  it('should throw error for expired token', () => {
    const expiredToken = sign(payload, secret, { expiresIn: '1ms' });

    // Wait a bit to ensure token expires
    return new Promise(resolve => {
      setTimeout(() => {
        expect(() => verify(expiredToken, secret))
          .toThrow(TokenExpiredError);
        resolve();
      }, 10);
    });
  });

  it('should accept custom verify options', () => {
    const token = sign(payload, secret, { algorithm: 'HS256' });

    const decoded = verify(token, secret, { algorithms: ['HS256'] });
    expect(decoded.userId).toBe(123);
  });

  it('should use default algorithms when not specified in options', () => {
    const decoded = verify(validToken, secret, {});

    expect(decoded.userId).toBe(123);
    expect(decoded.username).toBe('testuser');
  });

  it('should throw error for empty token', () => {
    expect(() => verify('', secret)).toThrow();
    expect(() => verify(null, secret)).toThrow();
  });

  it('should throw error for missing secret', () => {
    expect(() => verify(validToken, null)).toThrow();
    expect(() => verify(validToken, undefined)).toThrow();
  });
});

describe('castJwtError', () => {
  it('should cast jwt.TokenExpiredError to internal TokenExpiredError', async () => {
    const expiredAt = new Date('2023-01-01');
    const originalError = new JwtTokenExpiredError('token expired', expiredAt);
    
    const result = castJwtError(originalError);
    
    expect(result).toBeInstanceOf(TokenExpiredError);
    expect(result.message).toBe('token expired');
    expect(result.expiredAt).toBe(expiredAt);
    expect(result.cause).toBe(originalError);
  });

  it('should cast jwt.NotBeforeError to internal NotBeforeError', async () => {
    const date = new Date('2024-01-01');
    const originalError = new JwtNotBeforeError('not before', date);
    
    const result = castJwtError(originalError);
    
    expect(result).toBeInstanceOf(NotBeforeError);
    expect(result.message).toBe('not before');
    expect(result.date).toBe(date);
    expect(result.cause).toBe(originalError);
  });

  it('should cast jwt.JsonWebTokenError with "invalid signature" to InvalidSignatureError', async () => {
    const innerError = new Error('inner');
    const originalError = new JwtJsonWebTokenError('invalid signature', innerError);
    
    const result = castJwtError(originalError);
    
    expect(result).toBeInstanceOf(InvalidSignatureError);
    expect(result.message).toBe('invalid signature');
    expect(result.inner).toBe(originalError);
    expect(result.cause).toBe(originalError);
  });

  it('should cast jwt.JsonWebTokenError (non-signature) to JsonWebTokenError', async () => {
    const innerError = new Error('inner');
    const originalError = new JwtJsonWebTokenError('malformed jwt', innerError);
    
    const result = castJwtError(originalError);
    
    expect(result).toBeInstanceOf(JsonWebTokenError);
    expect(result.message).toBe('malformed jwt');
    expect(result.inner).toBe(originalError);
    expect(result.cause).toBe(originalError);
  });

  it('should return original error for unknown error types', () => {
    const unknownError = new Error('unknown error');
    
    const result = castJwtError(unknownError);
    
    expect(result).toBe(unknownError);
  });

  it('should handle non-Error objects gracefully', () => {
    const notAnError = { message: 'not an error' };
    
    const result = castJwtError(notAnError);
    
    expect(result).toBe(notAnError);
  });
});

describe('decodePayload', () => {
  const secret = 'test-secret-key';
  const payload = { userId: 123, username: 'testuser' };
  let validToken;

  beforeAll(() => {
    validToken = sign(payload, secret);
  });

  it('should decode JWT payload without verification', () => {
    const decoded = decodePayload(validToken);

    expect(decoded.userId).toBe(123);
    expect(decoded.username).toBe('testuser');
    expect(typeof decoded.exp).toBe('number');
    expect(typeof decoded.iat).toBe('number');
  });

  it('should decode expired token payload without error', () => {
    const expiredToken = sign(payload, secret, { expiresIn: '1ms' });
    
    // Should decode even if expired (no verification)
    const decoded = decodePayload(expiredToken);
    expect(decoded.userId).toBe(123);
  });

  it('should decode token with wrong secret without error', () => {
    const tokenWithWrongSecret = sign(payload, 'wrong-secret');
    
    // Should decode regardless of secret (no verification)
    const decoded = decodePayload(tokenWithWrongSecret);
    expect(decoded.userId).toBe(123);
  });

  it('should throw error for invalid token format - no dots', () => {
    expect(() => decodePayload('invalidtoken')).toThrow(
      'Invalid token, missing [.] token as payload start indicator'
    );
  });

  it('should throw error for invalid token format - only one dot', () => {
    expect(() => decodePayload('header.payload')).toThrow(
      'Invalid token, missing second [.] token as payload end indicator'
    );
  });

  it('should throw error for empty token', () => {
    expect(() => decodePayload('')).toThrow();
    expect(() => decodePayload(null)).toThrow();
    expect(() => decodePayload(undefined)).toThrow();
  });

  it('should throw error for malformed base64 payload', () => {
    const malformedToken = 'header.invalid-base64!.signature';
    expect(() => decodePayload(malformedToken)).toThrow();
  });

  it('should throw error for non-JSON payload', () => {
    // Create a token with non-JSON payload
    const invalidPayload = btoa('not-json-content');
    const malformedToken = `header.${invalidPayload}.signature`;
    expect(() => decodePayload(malformedToken)).toThrow();
  });
});

describe('expiresAtUTC', () => {
  it('should convert exp timestamp to UTC string', () => {
    const token = { exp: 1672531200 }; // 2023-01-01 00:00:00 UTC
    const result = expiresAtUTC(token);

    expect(result).toBe('Sun, 01 Jan 2023 00:00:00 GMT');
  });

  it('should return null when no exp claim', () => {
    const token = { userId: 123, username: 'testuser' };
    const result = expiresAtUTC(token);

    expect(result).toBeNull();
  });

  it('should handle exp value of 0', () => {
    const token = { exp: 0 }; // Unix epoch
    const result = expiresAtUTC(token);

    expect(result).toBe('Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('should handle future exp timestamp', () => {
    const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const token = { exp: futureTimestamp };
    const result = expiresAtUTC(token);

    expect(typeof result).toBe('string');
    expect(result).toContain('GMT');
  });

  it('should throw error for invalid token parameter', () => {
    expect(() => expiresAtUTC(null)).toThrow();
    expect(() => expiresAtUTC(undefined)).toThrow();
    expect(() => expiresAtUTC('not-an-object')).toThrow();
    expect(() => expiresAtUTC(123)).toThrow();
  });

  it('should handle empty object', () => {
    const token = {};
    const result = expiresAtUTC(token);

    expect(result).toBeNull();
  });

  it('should work with decoded token from decodePayload', () => {
    const secret = 'test-secret-key';
    const originalPayload = { userId: 123 };
    const token = sign(originalPayload, secret, { expiresIn: 1672531200 });
    
    const decoded = decodePayload(token);
    const expiresAt = expiresAtUTC(decoded);

    expect(typeof expiresAt).toBe('string');
    expect(expiresAt).toContain('GMT');
  });
});
