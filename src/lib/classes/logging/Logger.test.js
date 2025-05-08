/**
 * @fileoverview Unit tests for Logger.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

import
  {
    Logger,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
    NONE
  } from './index.js';

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
    logger.on('log', logHandler);

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
    expect(logEventInfo.service).toBe('testService');
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

  it('should include details in log events', () => {
    const errorHandler = vi.fn();
    logger.on(ERROR, errorHandler);
    
    const details = { code: 500, message: 'Server error' };
    logger.error('Operation failed', details);
    
    expect(errorHandler).toHaveBeenCalledTimes(1);
    const logEvent = errorHandler.mock.calls[0][0];
    
    expect(logEvent.details).toEqual(details);
  });

  it('should emit both specific and generic log events', () => {
    const warnHandler = vi.fn();
    const logHandler = vi.fn();
    
    logger.on(WARN, warnHandler);
    logger.on('log', logHandler);
    
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
    logger.on('log', logHandler);
    
    logger.setLevel(NONE);
    
    // No logs should be emitted at NONE level
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.fatal('Fatal message');
    
    expect(logHandler).not.toHaveBeenCalled();
  });

  it('should correctly follow log level hierarchy', () => {
    const logHandler = vi.fn();
    logger.on('log', logHandler);
    
    // Set to WARN level
    logger.setLevel(WARN);
    
    // These should be filtered
    logger.debug('Debug message');
    logger.info('Info message');
    expect(logHandler).toHaveBeenCalledTimes(0);
    
    // These should pass through
    logger.warn('Warning message');
    logger.error('Error message');
    logger.fatal('Fatal message');
    
    expect(logHandler).toHaveBeenCalledTimes(3);
  });
});
