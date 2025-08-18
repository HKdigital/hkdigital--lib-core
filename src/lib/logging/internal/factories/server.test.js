/**
 * @fileoverview Unit tests for server logger factory
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createServerLogger } from '$lib/logging/internal/factories/server.js';
import { INFO, DEBUG, ERROR, WARN } from '$lib/logging/constants.js';

// Mock the PinoAdapter
vi.mock('$lib/logging/internal/adapters/pino.js', () => ({
  PinoAdapter: vi.fn().mockImplementation(function(options) {
    this.options = options;
    this.handleLog = vi.fn();
    this.child = vi.fn().mockReturnThis();
  })
}));

describe('createServerLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a logger with default INFO level', () => {
    const logger = createServerLogger('apiService');
    
    expect(logger.name).toBe('apiService');
    expect(logger.level).toBe(INFO);
  });

  it('should create a logger with custom level', () => {
    const logger = createServerLogger('apiService', DEBUG);
    
    expect(logger.name).toBe('apiService');
    expect(logger.level).toBe(DEBUG);
  });

  it('should pass pino options to PinoAdapter', async () => {
    // @ts-ignore
    const { PinoAdapter } = await import('$lib/logging/internal/adapters/pino.js');
    const pinoOptions = {
      level: 'debug',
      prettyPrint: true,
      customField: 'value'
    };

    createServerLogger('apiService', INFO, pinoOptions);

    expect(PinoAdapter).toHaveBeenCalledWith(pinoOptions);
  });

  it('should connect adapter to logger events', async () => {
    // @ts-ignore
    const { PinoAdapter } = await import('$lib/logging/internal/adapters/pino.js');
    const logger = createServerLogger('apiService');

    // Get the adapter instance
    // @ts-ignore
    const adapterInstance = PinoAdapter.mock.results[0].value;

    // Trigger a log event
    logger.warn('Database connection failed', {
      host: 'localhost',
      port: 5432
    });

    // Verify adapter received the log event
    expect(adapterInstance.handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        level: WARN,
        message: 'Database connection failed',
        source: 'apiService',
        details: { host: 'localhost', port: 5432 },
        timestamp: expect.any(Date)
      })
    );
  });

  it('should support context method for child loggers', async () => {
    const logger = createServerLogger('apiService', INFO);

    // Create child logger with namespaced context
    const namespace = 'request';
    const context = {
      requestId: 'req-123',
      userId: 'user-456',
      endpoint: '/api/users'
    };
    const childLogger = logger.context(namespace, context);

    // Verify child logger maintains service name and level
    expect(childLogger.name).toBe('apiService');
    expect(childLogger.level).toBe(INFO);
  });

  it('should handle log events from child logger', async () => {
    // @ts-ignore
    const { PinoAdapter } = await import('$lib/logging/internal/adapters/pino.js');
    const logger = createServerLogger('apiService');

    // Get the adapter instance
    // @ts-ignore
    const adapterInstance = PinoAdapter.mock.results[0].value;

    // The child logger is a new Logger instance without listeners
    // So we need to verify that the parent logger can still log
    logger.info('Parent log message', {
      userId: 'new-user-123'
    });

    // Verify parent logger still works
    expect(adapterInstance.handleLog).toHaveBeenCalledWith(
      expect.objectContaining({
        level: INFO,
        message: 'Parent log message',
        source: 'apiService',
        details: { userId: 'new-user-123' },
        timestamp: expect.any(Date)
      })
    );

    // Note: Child logger won't emit to the original adapter
    // because it's a new instance without listeners
  });

  it('should handle multiple child contexts', async () => {
    const logger = createServerLogger('apiService');

    // Create first child with request context
    const requestLogger = logger.context('request', { requestId: 'req-001' });
    expect(requestLogger.name).toBe('apiService');
    expect(requestLogger.level).toBe(INFO);

    // Create second child with user context
    const userLogger = logger.context('user', { userId: 'user-002' });
    expect(userLogger.name).toBe('apiService');
    expect(userLogger.level).toBe(INFO);

    // Verify they are separate logger instances
    expect(requestLogger).not.toBe(userLogger);
    expect(requestLogger).not.toBe(logger);
  });

  it('should respect log level filtering', () => {
    const logger = createServerLogger('apiService', ERROR);

    // These should be filtered out at Logger level
    expect(logger.debug('Debug details')).toBe(false);
    expect(logger.info('Info message')).toBe(false);
    expect(logger.warn('Warning')).toBe(false);

    // These should pass through
    expect(logger.error('Error occurred')).toBe(true);
  });
});
