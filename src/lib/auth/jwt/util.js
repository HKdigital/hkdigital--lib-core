/**
 * JWT utility functions
 *
 * @description
 * This module provides utility functions for JWT operations including error casting.
 */

import jwt, { 
  TokenExpiredError as JwtTokenExpiredError,
  JsonWebTokenError as JwtJsonWebTokenError,
  NotBeforeError as JwtNotBeforeError
} from 'jsonwebtoken';
import {
  TokenExpiredError,
  JsonWebTokenError,
  InvalidSignatureError,
  NotBeforeError
} from './errors.js';

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