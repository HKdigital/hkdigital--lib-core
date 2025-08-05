/**
 * @fileoverview Unit tests for ConsoleAdapter
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleAdapter } from '$lib/logging/internal/adapters/console.js';
import { DEBUG, INFO, WARN, ERROR } from '$lib/logging/internal/constants.js';

describe('ConsoleAdapter', () => {
  let adapter;
  let consoleMocks;

  beforeEach(() => {
    // Mock all console methods
    consoleMocks = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    };
    
    adapter = new ConsoleAdapter();
  });

  afterEach(() => {
    // Restore all console methods
    Object.values(consoleMocks).forEach(mock => mock.mockRestore());
  });

  describe('constructor', () => {
    it('should create adapter with default options', () => {
      const adapter = new ConsoleAdapter();
      expect(adapter.level).toBe('info');
      expect(adapter.context).toEqual({});
    });

    it('should create adapter with custom options', () => {
      const adapter = new ConsoleAdapter({
        level: 'debug',
        context: { source: 'test', version: '1.0' }
      });
      expect(adapter.level).toBe('debug');
      expect(adapter.context).toEqual({ source: 'test', version: '1.0' });
    });
  });

  describe('handleLog', () => {
    it('should log info messages with correct styling', () => {
      const logEvent = {
        level: INFO,
        message: 'Test info message',
        source: 'TestService',
        timestamp: new Date(),
        details: { userId: '123' }
      };

      adapter.handleLog(logEvent);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        '%c[TestService]',
        'padding: 2px 4px; border-radius: 2px; font-weight: bold; background: #e8f5e8; color: #2e7d32;',
        'Test info message',
        { userId: '123' }
      );
    });

    it('should log error messages with correct styling', () => {
      const logEvent = {
        level: ERROR,
        message: 'Test error',
        source: 'ErrorService',
        timestamp: new Date()
      };

      adapter.handleLog(logEvent);

      expect(consoleMocks.error).toHaveBeenCalledWith(
        '%c[ErrorService]',
        'padding: 2px 4px; border-radius: 2px; font-weight: bold; background: #ffebee; color: #d32f2f;',
        'Test error'
      );
    });

    it('should include context in log output', () => {
      const adapterWithContext = new ConsoleAdapter({
        context: { requestId: 'req-123' }
      });

      const logEvent = {
        level: INFO,
        message: 'Request processed',
        source: 'API',
        timestamp: new Date(),
        details: { statusCode: 200 }
      };

      adapterWithContext.handleLog(logEvent);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        '%c[API]',
        expect.any(String),
        'Request processed',
        { requestId: 'req-123', statusCode: 200 }
      );
    });

    it('should filter logs below configured level', () => {
      const warnAdapter = new ConsoleAdapter({ level: WARN });

      // Debug should be filtered
      warnAdapter.handleLog({
        level: DEBUG,
        message: 'Debug message',
        source: 'Test',
        timestamp: new Date()
      });
      expect(consoleMocks.debug).not.toHaveBeenCalled();

      // Info should be filtered
      warnAdapter.handleLog({
        level: INFO,
        message: 'Info message',
        source: 'Test',
        timestamp: new Date()
      });
      expect(consoleMocks.info).not.toHaveBeenCalled();

      // Warn should pass through
      warnAdapter.handleLog({
        level: WARN,
        message: 'Warning message',
        source: 'Test',
        timestamp: new Date()
      });
      expect(consoleMocks.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle logs without details', () => {
      const logEvent = {
        level: INFO,
        message: 'Simple message',
        source: 'SimpleService',
        timestamp: new Date()
      };

      adapter.handleLog(logEvent);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        '%c[SimpleService]',
        expect.any(String),
        'Simple message'
      );
      // Should NOT have a 4th argument
      expect(consoleMocks.info).toHaveBeenCalledTimes(1);
      expect(consoleMocks.info.mock.calls[0].length).toBe(3);
    });

    it('should show context when no details but context exists', () => {
      const contextAdapter = new ConsoleAdapter({
        context: { env: 'production' }
      });

      const logEvent = {
        level: INFO,
        message: 'Message without details',
        source: 'ContextService',
        timestamp: new Date()
      };

      contextAdapter.handleLog(logEvent);

      expect(consoleMocks.info).toHaveBeenCalledWith(
        '%c[ContextService]',
        expect.any(String),
        'Message without details',
        { env: 'production' }
      );
    });
  });

  describe('styling', () => {
    it('should apply correct styles for each log level', () => {
      // Create adapter with DEBUG level to test all levels
      const debugAdapter = new ConsoleAdapter({ level: DEBUG });

      const levels = [
        { level: DEBUG, method: 'debug', color: '#1976d2', bg: '#e3f2fd' },
        { level: INFO, method: 'info', color: '#2e7d32', bg: '#e8f5e8' },
        { level: WARN, method: 'warn', color: '#f57c00', bg: '#fff3e0' },
        { level: ERROR, method: 'error', color: '#d32f2f', bg: '#ffebee' }
      ];

      levels.forEach(({ level, method, color, bg }) => {
        // Clear previous calls
        vi.clearAllMocks();

        debugAdapter.handleLog({
          level,
          message: `${level} message`,
          source: 'StyleTest',
          timestamp: new Date()
        });

        const expectedStyle = `padding: 2px 4px; border-radius: 2px; font-weight: bold; background: ${bg}; color: ${color};`;

        expect(consoleMocks[method]).toHaveBeenCalledWith(
          '%c[StyleTest]',
          expectedStyle,
          `${level} message`
        );
      });
    });
  });

  describe('child method', () => {
    it('should create child adapter with merged context', () => {
      const parentAdapter = new ConsoleAdapter({
        level: WARN,
        context: { app: 'myapp', version: '1.0' }
      });

      const childAdapter = parentAdapter.child({
        userId: '123',
        requestId: 'req-456'
      });

      expect(childAdapter.level).toBe(WARN);
      expect(childAdapter.context).toEqual({
        app: 'myapp',
        version: '1.0',
        userId: '123',
        requestId: 'req-456'
      });
    });

    it('should handle child adapter logging', () => {
      const parentAdapter = new ConsoleAdapter({
        context: { app: 'parent' }
      });

      const childAdapter = parentAdapter.child({
        module: 'child'
      });

      childAdapter.handleLog({
        level: ERROR,
        message: 'Child error',
        source: 'ChildService',
        timestamp: new Date(),
        details: { code: 500 }
      });

      expect(consoleMocks.error).toHaveBeenCalledWith(
        '%c[ChildService]',
        expect.any(String),
        'Child error',
        {
          app: 'parent',
          module: 'child',
          code: 500
        }
      );
    });
  });

  describe('console method selection', () => {
    it('should use correct console method for each level', () => {
      // Create adapter with DEBUG level to allow all logs
      const debugAdapter = new ConsoleAdapter({ level: DEBUG });

      const logEvent = {
        source: 'MethodTest',
        timestamp: new Date(),
        message: 'Test message'
      };

      // Debug uses console.debug
      debugAdapter.handleLog({ ...logEvent, level: DEBUG });
      expect(consoleMocks.debug).toHaveBeenCalledTimes(1);

      // Info uses console.info
      debugAdapter.handleLog({ ...logEvent, level: INFO });
      expect(consoleMocks.info).toHaveBeenCalledTimes(1);

      // Warn uses console.warn
      debugAdapter.handleLog({ ...logEvent, level: WARN });
      expect(consoleMocks.warn).toHaveBeenCalledTimes(1);

      // Error uses console.error
      debugAdapter.handleLog({ ...logEvent, level: ERROR });
      expect(consoleMocks.error).toHaveBeenCalledTimes(1);
    });
  });
});
