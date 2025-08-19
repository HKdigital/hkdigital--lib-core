import { describe, test, expect } from 'vitest';
import { ErrorEvent, PromiseRejectionEvent } from './events.js';

describe('is/events', () => {
  describe('ErrorEvent', () => {
    test('should identify ErrorEvent objects', () => {
      const errorEvent = {
        constructor: { name: 'ErrorEvent' },
        message: 'Test error',
        filename: 'test.js'
      };
      
      expect(ErrorEvent(errorEvent)).toBe(true);
    });

    test('should reject non-ErrorEvent objects', () => {
      expect(ErrorEvent(null)).toBe(false);
      expect(ErrorEvent(undefined)).toBe(false);
      expect(ErrorEvent({})).toBe(false);
      expect(ErrorEvent(new Error('test'))).toBe(false);
      expect(ErrorEvent({ constructor: { name: 'Error' } })).toBe(false);
    });
  });

  describe('PromiseRejectionEvent', () => {
    test('should identify PromiseRejectionEvent objects', () => {
      const rejectionEvent = {
        constructor: { name: 'PromiseRejectionEvent' },
        reason: 'Test rejection'
      };
      
      expect(PromiseRejectionEvent(rejectionEvent)).toBe(true);
    });

    test('should reject non-PromiseRejectionEvent objects', () => {
      expect(PromiseRejectionEvent(null)).toBe(false);
      expect(PromiseRejectionEvent(undefined)).toBe(false);
      expect(PromiseRejectionEvent({})).toBe(false);
      expect(PromiseRejectionEvent(new Error('test'))).toBe(false);
    });
  });
});