/**
 * @fileoverview Unit tests for formatting functions
 */
import { describe, it, expect } from 'vitest';
import {
  parseFunctionName,
  isMeaningfulFunctionName,
  extractUserFunctionName,
  formatErrorDisplay
} from './formatting.js';

describe('formatting', () => {
  describe('parseFunctionName', () => {
    it('should parse Firefox format function names', () => {
      expect(parseFunctionName('myFunction@file.js:10:5')).toBe('myFunction');
      expect(parseFunctionName('SomeClass.method@path/file.js:20:10')).toBe(
        'SomeClass.method'
      );
    });

    it('should parse Node.js format function names', () => {
      expect(parseFunctionName('    at myFunction (file.js:10:5)')).toBe(
        'myFunction'
      );
      expect(parseFunctionName('    at Module.myFunction (file.js:10:5)')).toBe(
        'myFunction'
      );
    });

    it('should handle anonymous functions within named functions', () => {
      expect(parseFunctionName('initClientServices/<@manager.js:55:17')).toBe(
        'initClientServices (anonymous)'
      );
      expect(parseFunctionName('startAll/<@ServiceManager.js:400:15')).toBe(
        'startAll (anonymous)'
      );
    });

    it('should return null for unparseable frames', () => {
      expect(parseFunctionName('invalid frame format')).toBe(null);
      expect(parseFunctionName('')).toBe(null);
    });
  });

  describe('isMeaningfulFunctionName', () => {
    it('should accept normal function names', () => {
      expect(isMeaningfulFunctionName('myFunction')).toBe(true);
      expect(isMeaningfulFunctionName('SomeClass.method')).toBe(true);
      expect(isMeaningfulFunctionName('camelCaseFunction')).toBe(true);
    });

    it('should accept anonymous functions within named functions', () => {
      expect(isMeaningfulFunctionName('initClientServices (anonymous)')).toBe(
        true
      );
      expect(isMeaningfulFunctionName('startAll (anonymous)')).toBe(true);
    });

    it('should reject meaningless function names', () => {
      expect(isMeaningfulFunctionName('')).toBe(false);
      expect(isMeaningfulFunctionName('async ')).toBe(false);
      expect(isMeaningfulFunctionName('async')).toBe(false);
      expect(isMeaningfulFunctionName('Promise')).toBe(false);
      expect(isMeaningfulFunctionName('new Promise')).toBe(false);
    });

    it('should reject pure anonymous functions', () => {
      expect(isMeaningfulFunctionName('<')).toBe(false);
      expect(isMeaningfulFunctionName('</')).toBe(false);
    });

    it('should reject internal/framework functions', () => {
      expect(isMeaningfulFunctionName('internal.something')).toBe(false);
      expect(isMeaningfulFunctionName('node_modules.lib')).toBe(false);
    });
  });

  describe('formatErrorDisplay', () => {
    it('should format with origin', () => {
      const errorMeta = {
        category: 'http',
        method: 'httpGet',
        origin: 'fetchUserData'
      };
      expect(formatErrorDisplay(errorMeta)).toBe('httpGet in fetchUserData');
    });

    it('should format without origin', () => {
      const errorMeta = {
        category: 'error',
        method: 'error',
        origin: null
      };
      expect(formatErrorDisplay(errorMeta)).toBe('error');
    });

    it('should handle anonymous function origins', () => {
      const errorMeta = {
        category: 'validation',
        method: 'expect',
        origin: 'initClientServices (anonymous)'
      };
      expect(formatErrorDisplay(errorMeta)).toBe(
        'expect in initClientServices (anonymous)'
      );
    });
  });

  describe('extractUserFunctionName integration', () => {
    it('should extract meaningful names from stack with anonymous functions', () => {
      const mockStack = [
        'Logger.error@logger/Logger.js:100:10',
        'initClientServices (anonymous)@manager.js:55:17',
        'start@hooks.client.js:8:11'
      ];
      
      const mockError = { name: 'LoggerError' };
      const result = extractUserFunctionName(mockError, mockStack);
      expect(result).toBe('initClientServices (anonymous)');
    });
  });

  describe('stack trace path cleaning integration', () => {
    it('should handle pnpm paths in real scenarios', () => {
      // This tests the integration with console adapter's path cleaning
      const mockStack = [
        'startAll@node_modules/.pnpm/@hkdigital+lib-core@0.4.35_deps/node_modules/@hkdigital/lib-core/dist/services/ServiceManager.js:400:15',
        'initServices@src/hooks.client.js:8:11'
      ];
      
      const mockError = { name: 'Error' };
      // The stack should be cleaned by console adapter before reaching these functions
      // but we test with already-cleaned stack here
      const cleanedStack = [
        'startAll@lib-core/dist/services/ServiceManager.js:400:15',
        'initServices@src/hooks.client.js:8:11'
      ];
      
      const result = extractUserFunctionName(mockError, cleanedStack);
      expect(result).toBe('startAll');
    });
  });
});