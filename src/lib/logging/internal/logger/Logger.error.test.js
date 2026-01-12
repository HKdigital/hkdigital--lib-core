/**
 * @fileoverview Comprehensive tests for Logger.error() method
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Logger from './Logger.js';
import { ERROR } from '$lib/logging/levels.js';

describe('Logger.error() - Parameter Combinations', () => {
  let logger;
  let errorHandler;

  beforeEach(() => {
    logger = new Logger('testService');
    errorHandler = vi.fn();
    logger.on(ERROR, errorHandler);
  });

  describe('Single Error parameter', () => {
    it('should handle Error object', () => {
      const error = new Error('Test error');
      const result = logger.error(error);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Test error');
      expect(logEvent.details).toBe(error); // The error becomes the details
    });

    it('should handle ErrorEvent', () => {
      const innerError = new Error('Inner error');
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: innerError,
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const result = logger.error(errorEvent);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Event message');
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.cause).toBe(innerError);
      expect(logEvent.details.details.type).toBe('ErrorEvent');
      expect(logEvent.details.details.filename).toBe('test.js');
    });

    it('should handle PromiseRejectionEvent with Error reason', () => {
      const originalError = new Error('Promise rejected');
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: originalError
      };

      const result = logger.error(rejectionEvent);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Promise rejected');
      expect(logEvent.details).toBe(originalError); // Error reason becomes details directly
    });

    it('should handle PromiseRejectionEvent with string reason', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: 'String rejection'
      };

      const result = logger.error(rejectionEvent);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('String rejection');
      expect(logEvent.details.name).toBe('DetailedError');
    });
  });

  describe('Error + Details parameter', () => {
    it('should handle Error + details', () => {
      const error = new Error('Test error');
      const details = { url: '/page', userAgent: 'Chrome' };
      const result = logger.error(error, details);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe(''); // DetailedError wrapper has no message
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(details);
      expect(logEvent.details.cause).toBe(error);
    });

    it('should handle ErrorEvent + details', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Inner error'),
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const customDetails = { url: '/page', context: 'browser' };
      const result = logger.error(errorEvent, customDetails);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe(''); // DetailedError wrapper has no message
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(customDetails);
      // The converted ErrorEvent becomes the cause
      expect(logEvent.details.cause.name).toBe('DetailedError');
      expect(logEvent.details.cause.details.type).toBe('ErrorEvent');
    });

    it('should handle PromiseRejectionEvent + details', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: new Error('Promise failed')
      };

      const contextDetails = { endpoint: '/api/data', timeout: 5000 };
      const result = logger.error(rejectionEvent, contextDetails);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe(''); // DetailedError wrapper has no message
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(contextDetails);
      expect(logEvent.details.cause.message).toBe('Promise failed');
    });
  });

  describe('String + Error parameter', () => {
    it('should handle string + Error', () => {
      const error = new Error('Original error');
      const result = logger.error('Custom message', error);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Custom message');
      expect(logEvent.details).toBe(error);
    });

    it('should handle string + ErrorEvent', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Inner error'),
        message: 'Event message',
        filename: 'test.js',
        lineno: 42,
        colno: 10
      };

      const result = logger.error('Browser error occurred', errorEvent);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Browser error occurred');
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details.type).toBe('ErrorEvent');
    });

    it('should handle string + PromiseRejectionEvent', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: 'Promise timeout'
      };

      const result = logger.error('Async operation failed', rejectionEvent);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Async operation failed');
      expect(logEvent.details.name).toBe('DetailedError');
    });
  });

  describe('String + Error + Details parameter', () => {
    it('should handle string + Error + details', () => {
      const error = new Error('Original error');
      const details = { component: 'UserForm', action: 'submit' };
      const result = logger.error('Form submission failed', error, details);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Form submission failed');
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(details);
      expect(logEvent.details.cause).toBe(error);
    });

    it('should handle string + ErrorEvent + details', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Script error'),
        message: 'Uncaught TypeError',
        filename: 'app.js',
        lineno: 123,
        colno: 45
      };

      const details = { userAgent: 'Chrome', url: '/dashboard' };
      const result = logger.error('JavaScript error in browser', errorEvent, details);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('JavaScript error in browser');
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(details);
      expect(logEvent.details.cause.name).toBe('DetailedError');
      expect(logEvent.details.cause.details.type).toBe('ErrorEvent');
    });
  });

  describe('Invalid parameter combinations', () => {
    it('should handle string only (invalid)', () => {
      const result = logger.error('Just a string');

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Missing error like object in Logger.error parameters');
      expect(logEvent.details.name).toBe('DetailedError');
      expect(Array.isArray(logEvent.details.details)).toBe(true);
    });

    it('should handle non-error objects', () => {
      const result = logger.error(123);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Missing error like object in Logger.error parameters');
      expect(logEvent.details.name).toBe('DetailedError');
    });

    it('should handle null/undefined', () => {
      const result = logger.error(null);

      expect(result).toBe(true);
      expect(errorHandler).toHaveBeenCalledTimes(1);

      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.level).toBe(ERROR);
      expect(logEvent.message).toBe('Missing error like object in Logger.error parameters');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle SvelteKit HandleClientError scenario', () => {
      const error = new Error('Network timeout');
      const details = {
        url: '/api/users',
        userAgent: 'Mozilla/5.0...',
        timestamp: Date.now()
      };

      const result = logger.error(error, details);

      expect(result).toBe(true);
      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.message).toBe(''); // DetailedError wrapper has no message
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(details);
      expect(logEvent.details.cause).toBe(error);
    });

    it('should handle unhandled window error with context', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        error: new Error('Uncaught ReferenceError'),
        message: 'someVar is not defined',
        filename: '/static/js/main.js',
        lineno: 42,
        colno: 15
      };

      const contextDetails = { route: '/dashboard', userId: 'user123' };
      const result = logger.error(errorEvent, contextDetails);

      expect(result).toBe(true);
      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.message).toBe(''); // DetailedError wrapper has no message
      expect(logEvent.details.name).toBe('DetailedError');
      expect(logEvent.details.details).toEqual(contextDetails);
      expect(logEvent.details.cause.name).toBe('DetailedError');
      expect(logEvent.details.cause.message).toBe('someVar is not defined'); // Original message in cause
    });

    it('should handle promise rejection with custom message and context', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: new Error('API call failed')
      };

      const contextDetails = { endpoint: '/api/orders', method: 'POST' };
      const result = logger.error('Order creation failed', rejectionEvent, contextDetails);

      expect(result).toBe(true);
      const logEvent = errorHandler.mock.calls[0][0];
      expect(logEvent.message).toBe('Order creation failed');
      expect(logEvent.details.details).toEqual(contextDetails);
      expect(logEvent.details.cause.message).toBe('API call failed');
    });
  });
});
