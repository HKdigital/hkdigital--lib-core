import { describe, it, expect, beforeAll } from 'vitest';

import { TokenExpiredError as JwtTokenExpiredError,
         JsonWebTokenError as JwtJsonWebTokenError,
         NotBeforeError as JwtNotBeforeError }  from 'jsonwebtoken';

import { castJwtError, sign, verify } from './util.js';

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
