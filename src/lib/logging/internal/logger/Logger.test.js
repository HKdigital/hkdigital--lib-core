/**
 * @fileoverview Unit tests for Logger.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Logger from './Logger.js';
import { DEBUG, INFO, WARN, ERROR, NONE, LOG } from '$lib/logging/levels.js';

describe('Logger', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger('testService', INFO);
  });

  it('should create a logger with the proper name and level', () => {
    expect(logger.name).toBe('testService');
    expect(logger.level).toBe(INFO);
  });

  it('should filter logs below the current level', () => {
    const infoHandler = vi.fn();
    const debugHandler = vi.fn();
    const logHandler = vi.fn();

    logger.on(INFO, infoHandler);
    logger.on(DEBUG, debugHandler);
    logger.on(LOG, logHandler);

    // Debug should be filtered out at INFO level
    const debugResult = logger.debug('Debug message');
    expect(debugResult).toBe(false);
    expect(debugHandler).not.toHaveBeenCalled();
    
    // Info should pass through
    const infoResult = logger.info('Info message');
    expect(infoResult).toBe(true);
    expect(infoHandler).toHaveBeenCalledTimes(1);
    expect(logHandler).toHaveBeenCalledTimes(1);
    
    const logEventInfo = infoHandler.mock.calls[0][0];
    expect(logEventInfo.level).toBe(INFO);
    expect(logEventInfo.message).toBe('Info message');
    expect(logEventInfo.source).toBe('testService');
  });

  it('should handle log level changes', () => {
    const debugHandler = vi.fn();
    logger.on(DEBUG, debugHandler);
    
    // At INFO level, debug is filtered
    logger.debug('Debug 1');
    expect(debugHandler).not.toHaveBeenCalled();
    
    // Change to DEBUG level
    const result = logger.setLevel(DEBUG);
    expect(result).toBe(true);
    expect(logger.level).toBe(DEBUG);
    
    // Now debug should pass through
    logger.debug('Debug 2');
    expect(debugHandler).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid log levels', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = logger.setLevel('INVALID_LEVEL');
    
    expect(result).toBe(false);
    expect(logger.level).toBe(INFO); // Unchanged
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('should emit both specific and generic log events', () => {
    const warnHandler = vi.fn();
    const logHandler = vi.fn();
    
    logger.on(WARN, warnHandler);
    logger.on(LOG, logHandler);
    
    logger.warn('Warning message');
    
    expect(warnHandler).toHaveBeenCalledTimes(1);
    expect(logHandler).toHaveBeenCalledTimes(1);
    
    // Both should receive the same log event object
    const warnEvent = warnHandler.mock.calls[0][0];
    const logEvent = logHandler.mock.calls[0][0];
    
    expect(warnEvent).toBe(logEvent);
  });

  it('should respect the NONE level to disable all logging', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);
    
    logger.setLevel(NONE);
    
    // No logs should be emitted at NONE level
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(logHandler).not.toHaveBeenCalled();
  });

  it('should correctly follow log level hierarchy', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);
    
    // Set to WARN level
    logger.setLevel(WARN);
    
    // These should be filtered
    logger.debug('Debug message');
    logger.info('Info message');
    expect(logHandler).toHaveBeenCalledTimes(0);
    
    // These should pass through
    logger.warn('Warning message');
    logger.error('Error message');

    expect(logHandler).toHaveBeenCalledTimes(2);
  });

  it('should handle context creation', () => {
    const contextLogger = logger.context('request', { requestId: '123' });
    
    expect(contextLogger).toBeInstanceOf(Logger);
    expect(contextLogger.name).toBe('testService');
    expect(contextLogger.level).toBe(INFO);
    
    // Test that context is applied
    const logHandler = vi.fn();
    contextLogger.on(LOG, logHandler);
    
    contextLogger.info('Test message');
    
    expect(logHandler).toHaveBeenCalledTimes(1);
    const logEvent = logHandler.mock.calls[0][0];
    expect(logEvent.context).toEqual({ request: { requestId: '123' } });
  });

  it('should throw error for invalid context namespace', () => {
    expect(() => {
      logger.context(123, { data: 'test' });
    }).toThrow('Invalid namespace');
  });
});

/**
 * Test for Logger.logFromEvent() method
 */
describe('Logger.logFromEvent()', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger('testService', INFO);
  });

  it('should forward a LogEvent from another logger', () => {
    const logHandler = vi.fn();
    const infoHandler = vi.fn();

    logger.on(LOG, logHandler);
    logger.on(INFO, infoHandler);

    // Create LogEventData as if it came from another logger
    const externalEventData = {
      timestamp: new Date('2024-01-01T10:00:00Z'),
      source: 'externalService', // Updated from 'service' to 'source'
      level: INFO,
      message: 'External log message',
      context: { requestId: '12345' },
      details: { userId: 'user123' }
    };

    logger.logFromEvent(externalEventData);

    // Should emit both specific level and generic log events
    expect(logHandler).toHaveBeenCalledTimes(1);
    expect(infoHandler).toHaveBeenCalledTimes(1);

    // Should forward the LogEvent preserving original properties
    const receivedLogEvent = logHandler.mock.calls[0][0];
    expect(receivedLogEvent.source).toBe('externalService'); // Original source preserved
    expect(receivedLogEvent.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
    expect(receivedLogEvent.context).toEqual({ requestId: '12345' });
    // eventName is no longer added - it was internal routing info
  });

  it('should filter LogEvents based on current log level', () => {
    const logHandler = vi.fn();
    const debugHandler = vi.fn();

    logger.on(LOG, logHandler);
    logger.on(DEBUG, debugHandler);

    // Create a DEBUG level LogEventData (should be filtered at INFO level)
    const debugEventData = {
      timestamp: new Date(),
      source: 'externalService',
      level: DEBUG,
      message: 'Debug message from external service',
      context: null,
      details: null
    };

    const result = logger.logFromEvent(debugEventData);

    // Should be filtered out
    expect(result).toBe(false);
    expect(logHandler).not.toHaveBeenCalled();
    expect(debugHandler).not.toHaveBeenCalled();
  });

  it('should respect log level hierarchy for LogEvents', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);

    // Set to WARN level
    logger.setLevel(WARN);

    // Create LogEventData at different levels
    const debugEvent = {
      timestamp: new Date(),
      source: 'external',
      level: DEBUG,
      message: 'Debug message',
      context: null,
      details: null
    };

    const infoEvent = {
      timestamp: new Date(),
      source: 'external',
      level: INFO,
      message: 'Info message',
      context: null,
      details: null
    };

    const warnEvent = {
      timestamp: new Date(),
      source: 'external',
      level: WARN,
      message: 'Warning message',
      context: null,
      details: null
    };

    const errorEvent = {
      timestamp: new Date(),
      source: 'external',
      level: ERROR,
      message: 'Error message',
      context: null,
      details: null
    };

    // These should be filtered
    logger.logFromEvent(debugEvent);
    logger.logFromEvent(infoEvent);
    expect(logHandler).toHaveBeenCalledTimes(0);

    // These should pass through
    logger.logFromEvent(warnEvent);
    logger.logFromEvent(errorEvent);
    expect(logHandler).toHaveBeenCalledTimes(2);
  });

  it('should handle LogEventData with null context and details', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);

    const minimalEventData = {
      timestamp: new Date(),
      source: 'minimal',
      level: ERROR,
      message: 'Simple error message',
      context: null,
      details: undefined
    };

    logger.logFromEvent(minimalEventData);

    expect(logHandler).toHaveBeenCalledTimes(1);
    const receivedEvent = logHandler.mock.calls[0][0];
    expect(receivedEvent.context).toBeNull();
    expect(receivedEvent.details).toBeUndefined();
    // eventName is no longer part of the log output
  });

  it('should preserve original LogEventData properties', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);

    const originalEventData = {
      timestamp: new Date('2024-06-15T14:30:00Z'),
      source: 'authService',
      level: WARN,
      message: 'Authentication attempt failed',
      context: {
        sessionId: 'abc123',
        ip: '192.168.1.1'
      },
      details: {
        attempts: 3,
        lastAttempt: '2024-06-15T14:29:45Z',
        reason: 'invalid_password'
      }
    };

    // Create a deep copy to verify the original isn't modified
    const originalCopy = structuredClone(originalEventData);

    logger.logFromEvent(originalEventData);

    expect(logHandler).toHaveBeenCalledTimes(1);
    const forwardedEvent = logHandler.mock.calls[0][0];

    // Should preserve all original properties
    expect(forwardedEvent.timestamp).toEqual(originalEventData.timestamp);
    expect(forwardedEvent.source).toBe(originalEventData.source);
    expect(forwardedEvent.level).toBe(originalEventData.level);
    expect(forwardedEvent.message).toBe(originalEventData.message);
    expect(forwardedEvent.context).toEqual(originalEventData.context);
    expect(forwardedEvent.details).toEqual(originalEventData.details);

    // eventName is no longer added to the forwarded event

    // Verify original eventData wasn't modified
    expect(originalEventData).toEqual(originalCopy);
  });

  it('should work with real event manager scenario', () => {
    const logHandler = vi.fn();
    logger.on(LOG, logHandler);

    // Simulate serviceManager.on('service:log', (data) => {...})
    const serviceLogData = {
      timestamp: new Date(),
      source: 'UserService',
      level: INFO,
      message: 'User registration completed',
      context: null,
      details: { userId: 'user_123', email: 'test@example.com' }
    };

    logger.logFromEvent(serviceLogData);

    expect(logHandler).toHaveBeenCalledTimes(1);
    const logEvent = logHandler.mock.calls[0][0];

    expect(logEvent.source).toBe('UserService');
    // eventName is no longer part of log events
    expect(logEvent.message).toBe('User registration completed');
  });
});
