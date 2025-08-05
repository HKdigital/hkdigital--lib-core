/**
 * @fileoverview Unit tests for universal logger factory
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { INFO, DEBUG } from '$lib/logging/internal/constants.js';

// Mock modules before any imports that use them
vi.mock('$app/environment', () => ({
  browser: false // Default to server-side
}));

vi.mock('$lib/logging/internal/factories/server.js', () => ({
  createServerLogger: vi.fn()
}));

vi.mock('$lib/logging/internal/factories/client.js', () => ({
  createClientLogger: vi.fn()
}));

// Import after mocks are set up
const { createLogger } = await import('$lib/logging/internal/factories/universal.js');
const { createServerLogger } = await import('$lib/logging/internal/factories/server.js');
const { createClientLogger } = await import('$lib/logging/internal/factories/client.js');

describe('createLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock return values
    // @ts-ignore
    createServerLogger.mockReturnValue({
      name: 'mockServerLogger',
      level: INFO,
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      context: vi.fn()
    });

    // @ts-ignore
    createClientLogger.mockReturnValue({
      name: 'mockClientLogger',
      level: INFO,
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      context: vi.fn()
    });
  });

  afterEach(() => {
    // Reset browser environment to default
    vi.doMock('$app/environment', () => ({
      browser: false
    }));
  });

  it('should use server logger when not in browser', () => {
    const logger = createLogger('universalService', INFO, { custom: 'option' });

    expect(createServerLogger).toHaveBeenCalledWith(
      'universalService',
      INFO,
      { custom: 'option' }
    );
    expect(createClientLogger).not.toHaveBeenCalled();
    expect(logger.name).toBe('mockServerLogger');
  });

  it('should use client logger when in browser', async () => {
    // Mock browser environment
    vi.doMock('$app/environment', () => ({
      browser: true
    }));

    // Clear module cache and re-import
    vi.resetModules();
    const { createLogger: createLoggerBrowser } = await import('$lib/logging/internal/factories/universal.js');

    const logger = createLoggerBrowser('universalService', DEBUG, {
      console: true
    });

    expect(createClientLogger).toHaveBeenCalledWith(
      'universalService',
      DEBUG,
      { console: true }
    );
    expect(logger.name).toBe('mockClientLogger');
  });

  it('should pass through all parameters correctly', () => {
    const serviceName = 'myUniversalService';
    const level = DEBUG;
    const options = {
      prettyPrint: true,
      customField: 'value',
      nested: { option: 'test' }
    };

    createLogger(serviceName, level, options);

    expect(createServerLogger).toHaveBeenCalledWith(
      serviceName,
      level,
      options
    );
  });

  it('should handle missing optional parameters', () => {
    // Only service name provided
    createLogger('minimalService');

    expect(createServerLogger).toHaveBeenCalledWith(
      'minimalService',
      undefined,
      {}
    );
  });

  it('should handle level without options', () => {
    createLogger('serviceWithLevel', DEBUG);

    expect(createServerLogger).toHaveBeenCalledWith(
      'serviceWithLevel',
      DEBUG,
      {}
    );
  });

  it('should return the logger instance from appropriate factory', () => {
    // Create mock logger with methods
    const mockLogger = {
      name: 'testService',
      level: INFO,
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      context: vi.fn()
    };

    // @ts-ignore
    createServerLogger.mockReturnValue(mockLogger);

    const logger = createLogger('testService');

    expect(logger).toBe(mockLogger);
    expect(logger.name).toBe('testService');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.context).toBe('function');
  });

  it('should switch factories based on environment', async () => {
    // Clear previous calls
    vi.clearAllMocks();

    // First call - server environment (default)
    createLogger('service1');
    expect(createServerLogger).toHaveBeenCalledTimes(1);
    expect(createClientLogger).toHaveBeenCalledTimes(0);

    // Switch to browser environment and re-import
    vi.doMock('$app/environment', () => ({
      browser: true
    }));
    vi.resetModules();

    const { createLogger: createLoggerBrowser } = await import('$lib/logging/internal/factories/universal.js');

    // Need to re-import mocked functions after module reset
    const { createClientLogger: clientLoggerMock } = await import('$lib/logging/internal/factories/client.js');
    // @ts-ignore
    clientLoggerMock.mockReturnValue({
      name: 'mockClientLogger',
      level: INFO,
      info: vi.fn()
    });

    // Second call - browser environment
    createLoggerBrowser('service2');
    expect(clientLoggerMock).toHaveBeenCalledTimes(1);
  });
});
