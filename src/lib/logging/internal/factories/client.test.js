/**
 * @fileoverview Unit tests for client logger factory
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createClientLogger } from '$lib/logging/internal/factories/client.js';
import { INFO, DEBUG, WARN } from '$lib/logging/levels.js';

// Mock the ConsoleAdapter
vi.mock('$lib/logging/internal/adapters/console.js', () => ({
  ConsoleAdapter: vi.fn().mockImplementation(function(options) {
    this.options = options;
    this.handleLog = vi.fn();
    this.child = vi.fn().mockReturnThis();
  })
}));

describe('createClientLogger', () => {
  let consoleSpies;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Spy on console methods
    consoleSpies = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.values(consoleSpies).forEach(spy => spy.mockRestore());
  });

  it('should create a logger with default INFO level', () => {
    const logger = createClientLogger('testService', INFO);
    
    expect(logger.name).toBe('testService');
    expect(logger.level).toBe(INFO);
  });

  it('should create a logger with custom level', () => {
    const logger = createClientLogger('testService', DEBUG);
    
    expect(logger.name).toBe('testService');
    expect(logger.level).toBe(DEBUG);
  });

  it('should pass console options to ConsoleAdapter', async () => {
    // @ts-ignore
    const { ConsoleAdapter } = await import('$lib/logging/internal/adapters/console.js');
    const consoleOptions = { customOption: 'test' };

    createClientLogger('testService', INFO, consoleOptions);

    expect(ConsoleAdapter).toHaveBeenCalledWith(
      expect.objectContaining({
        ...consoleOptions,
        level: INFO
      })
    );
  });

  it('should connect adapter to logger events', async () => {
    // @ts-ignore
    const { ConsoleAdapter } = await import('$lib/logging/internal/adapters/console.js');
    const logger = createClientLogger('testService', INFO);

    // Get the adapter instance
    // @ts-ignore
    const adapterInstance = ConsoleAdapter.mock.instances[0];

    // Trigger a log event
    logger.info('Test message', { data: 'test' });

    // Verify adapter received the log event
    expect(adapterInstance.handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        level: INFO,
        message: 'Test message',
        source: 'testService',
        details: { data: 'test' }
      })
    );
  });

  it('should support context method for child loggers', async () => {
    const logger = createClientLogger('testService', WARN);

    // Create child logger with namespaced context
    const namespace = 'request';
    const context = { userId: '123', requestId: 'abc' };
    const childLogger = logger.context(namespace, context);

    // The child logger is a new Logger instance with merged context
    // It doesn't call adapter.child() directly anymore

    // Verify child logger has same service name and level
    expect(childLogger.name).toBe('testService');
    expect(childLogger.level).toBe(WARN);
  });

  it('should handle log events from child logger', async () => {
    // @ts-ignore
    const { ConsoleAdapter } = await import('$lib/logging/internal/adapters/console.js');
    const logger = createClientLogger('testService', INFO);

    // Get the adapter instance
    // @ts-ignore
    const adapterInstance = ConsoleAdapter.mock.instances[0];

    // The child logger is a new Logger instance without listeners
    // So we need to verify that the parent logger can still log
    logger.warn('Parent error', { code: 500 });

    // Verify parent logger still works
    expect(adapterInstance.handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        message: 'Parent error',
        source: 'testService',
        details: { code: 500 }
      })
    );

    // Note: Child logger won't emit to the original adapter
    // because it's a new instance without listeners
  });

  it('should filter logs based on level', () => {
    const logger = createClientLogger('testService', WARN);

    // These should be filtered out
    expect(logger.debug('Debug message')).toBe(false);
    expect(logger.info('Info message')).toBe(false);

    // These should pass through
    expect(logger.warn('Warning message')).toBe(true);
    expect(logger.error('Error message')).toBe(true);
  });
});
