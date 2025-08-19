import { describe, test, expect, vi } from 'vitest';
import {
  castErrorEventToDetailedError,
  castPromiseRejectionToDetailedError
} from './util.js';
import Logger from './Logger.js';
import { ERROR } from '$lib/logging/constants.js';

describe('util - error casting', () => {

  describe('castErrorEventToDetailedError', () => {
    test('should cast ErrorEvent with error object', () => {
      const originalError = new Error('Original error');
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: originalError,
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const result = castErrorEventToDetailedError(errorEvent);

      expect(result.message).toBe('Original error');
      expect(result.details).toEqual({
        filename: 'test.js',
        lineno: 42,
        colno: 10,
        type: 'ErrorEvent'
      });
      expect(result.cause).toBe(originalError);
    });

    test('should cast ErrorEvent without error object', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: null,
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const result = castErrorEventToDetailedError(errorEvent);

      expect(result.message).toBe('Event message');
      expect(result.details.type).toBe('ErrorEvent');
      expect(result.cause).toBe(null);
    });

    test('should handle ErrorEvent with no message', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: null,
        message: '',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const result = castErrorEventToDetailedError(errorEvent);

      expect(result.message).toBe('Unknown error');
    });
  });

  describe('castPromiseRejectionToDetailedError', () => {
    test('should cast PromiseRejectionEvent with Error reason', () => {
      const originalError = new Error('Promise rejected');
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: originalError
      };

      const result = castPromiseRejectionToDetailedError(rejectionEvent);

      expect(result.message).toBe('Promise rejected');
      expect(result.details).toEqual({
        type: 'PromiseRejectionEvent',
        reasonType: 'object'
      });
      expect(result.cause).toBe(originalError);
    });

    test('should cast PromiseRejectionEvent with string reason', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: 'String rejection reason'
      };

      const result = castPromiseRejectionToDetailedError(rejectionEvent);

      expect(result.message).toBe('String rejection reason');
      expect(result.details).toEqual({
        type: 'PromiseRejectionEvent',
        reasonType: 'string'
      });
      expect(result.cause).toBe(null);
    });

    test('should cast PromiseRejectionEvent with non-Error object reason', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: { custom: 'rejection' }
      };

      const result = castPromiseRejectionToDetailedError(rejectionEvent);

      expect(result.message).toBe('[object Object]');
      expect(result.details.reasonType).toBe('object');
      expect(result.cause).toBe(null);
    });
  });

  describe('Logger integration', () => {
    test('should handle ErrorEvent without details', () => {
      const logger = new Logger('test');
      const logSpy = vi.fn();
      
      logger.on(ERROR, logSpy);

      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Test error'),
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      logger.error(errorEvent);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: ERROR,
          message: 'Test error',
          details: expect.objectContaining({
            name: 'DetailedError',
            details: expect.objectContaining({
              filename: 'test.js',
              lineno: 42,
              colno: 10,
              type: 'ErrorEvent'
            })
          })
        })
      );
    });

    test('should handle ErrorEvent with custom details', () => {
      const logger = new Logger('test');
      const logSpy = vi.fn();
      
      logger.on(ERROR, logSpy);

      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Test error'),
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const customDetails = { url: '/page', userAgent: 'Chrome' };
      logger.error(errorEvent, customDetails);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: ERROR,
          message: 'Test error',
          details: expect.objectContaining({
            name: 'DetailedError',
            details: customDetails
          })
        })
      );
    });

    test('should handle regular Error with details', () => {
      const logger = new Logger('test');
      const logSpy = vi.fn();
      
      logger.on(ERROR, logSpy);

      const error = new Error('Regular error');
      const customDetails = { url: '/page', userAgent: 'Chrome' };

      logger.error(error, customDetails);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: ERROR,
          message: 'Regular error',
          details: expect.objectContaining({
            name: 'DetailedError',
            details: customDetails,
            cause: error
          })
        })
      );
    });

    test('should handle string + Error + details pattern', () => {
      const logger = new Logger('test');
      const logSpy = vi.fn();
      
      logger.on(ERROR, logSpy);

      const error = new Error('Original error');
      const customDetails = { url: '/page' };

      logger.error('Custom message', error, customDetails);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: ERROR,
          message: 'Custom message',
          details: expect.objectContaining({
            name: 'DetailedError',
            details: customDetails,
            cause: error
          })
        })
      );
    });

    test('should handle string only with details', () => {
      const logger = new Logger('test');
      const logSpy = vi.fn();
      
      logger.on(ERROR, logSpy);

      const customDetails = { context: 'test' };

      logger.error('String message', customDetails);

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: ERROR,
          message: 'String message',
          details: expect.objectContaining({
            name: 'DetailedError',
            details: customDetails,
            cause: null
          })
        })
      );
    });
  });
});