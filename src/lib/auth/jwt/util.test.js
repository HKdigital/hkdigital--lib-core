import { describe, it, expect } from 'vitest';

import { TokenExpiredError as JwtTokenExpiredError,
         JsonWebTokenError as JwtJsonWebTokenError,
         NotBeforeError as JwtNotBeforeError }  from 'jsonwebtoken';

import { castJwtError } from './util.js';

import {
  TokenExpiredError,
  JsonWebTokenError,
  InvalidSignatureError,
  NotBeforeError
} from './errors.js';

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
