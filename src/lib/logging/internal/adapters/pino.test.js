/**
 * @fileoverview Unit tests for PinoAdapter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEBUG, INFO, WARN, ERROR } from '$lib/logging/index.js';

// Mock pino module
vi.mock('pino', () => ({
  default: vi.fn()
}));

// Mock $app/environment
vi.mock('$app/environment', () => ({
  dev: false
}));

// Import after mocks
const { PinoAdapter } = await import('$lib/logging/internal/adapters/pino.js');
const pino = (await import('pino')).default;

describe('PinoAdapter', () => {
  let mockPinoInstance;
  let adapter;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock pino instance
    mockPinoInstance = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      child: vi.fn()
    };
    
    // Mock pino to return our mock instance
    pino.mockReturnValue(mockPinoInstance);
    
    adapter = new PinoAdapter();
  });

  describe('constructor', () => {
    it('should create pino instance with default options in production', () => {
      new PinoAdapter();
      expect(pino).toHaveBeenCalledWith({});
    });

    it('should create pino instance with custom options', () => {
      const customOptions = {
        level: 'debug',
        name: 'my-app',
        customField: 'value'
      };
      
      new PinoAdapter(customOptions);
      expect(pino).toHaveBeenCalledWith(customOptions);
    });

    it('should use pretty transport in dev environment', async () => {
      // Mock dev environment
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      // Re-import to get updated environment
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      const pinoDev = (await import('pino')).default;
      
      pinoDev.mockReturnValue(mockPinoInstance);
      
      new PinoAdapterDev();
      
      expect(pinoDev).toHaveBeenCalledWith({
        level: 'debug',
        serializers: {
          err: expect.any(Function)
        },
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
      });
    });

    it('should merge custom options with dev defaults', async () => {
      // Mock dev environment
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      const pinoDev = (await import('pino')).default;
      
      pinoDev.mockReturnValue(mockPinoInstance);
      
      new PinoAdapterDev({ customField: 'custom' });
      
      expect(pinoDev).toHaveBeenCalledWith({
        level: 'debug',
        serializers: {
          err: expect.any(Function)
        },
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        },
        customField: 'custom'
      });
    });
  });

  describe('handleLog', () => {
    it('should pass log events to pino with correct format', () => {
      const logEvent = {
        level: INFO,
        message: 'Test message',
        details: { userId: '123' },
        source: 'TestService',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        {
          source: 'TestService',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          details: { userId: '123' }
        },
        'Test message'
      );
    });

    it('should handle all log levels correctly', () => {
      const baseEvent = {
        source: 'TestService',
        timestamp: new Date(),
        message: 'Test message'
      };

      // Test each level
      adapter.handleLog({ ...baseEvent, level: DEBUG });
      expect(mockPinoInstance.debug).toHaveBeenCalledTimes(1);

      adapter.handleLog({ ...baseEvent, level: INFO });
      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1);

      adapter.handleLog({ ...baseEvent, level: WARN });
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1);

      adapter.handleLog({ ...baseEvent, level: ERROR });
      expect(mockPinoInstance.error).toHaveBeenCalledTimes(1);
    });

    it('should handle logs without details', () => {
      const logEvent = {
        level: WARN,
        message: 'Warning without details',
        source: 'WarnService',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.warn).toHaveBeenCalledWith(
        {
          source: 'WarnService',
          timestamp: new Date('2024-01-01T12:00:00Z')
        },
        'Warning without details'
      );
    });

    it('should preserve complex details structure', () => {
      const complexDetails = {
        user: {
          id: '123',
          name: 'John',
          roles: ['admin', 'user']
        },
        request: {
          method: 'POST',
          path: '/api/users',
          headers: { 'content-type': 'application/json' }
        },
        metrics: {
          duration: 245,
          memory: 1024
        }
      };

      const logEvent = {
        level: INFO,
        message: 'Complex log',
        details: complexDetails,
        source: 'API',
        timestamp: new Date()
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.info).toHaveBeenCalledWith(
        {
          source: 'API',
          timestamp: expect.any(Date),
          details: complexDetails
        },
        'Complex log'
      );
    });
  });

  describe('child method', () => {
    it('should create child logger with context', () => {
      const mockChildPino = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn()
      };

      mockPinoInstance.child.mockReturnValue(mockChildPino);

      const context = { requestId: 'req-123', userId: 'user-456' };
      const childAdapter = adapter.child(context);

      expect(mockPinoInstance.child).toHaveBeenCalledWith(context);
      expect(childAdapter.pino).toBe(mockChildPino);
    });

    it('should handle logs from child adapter', () => {
      const mockChildPino = {
        info: vi.fn(),
        error: vi.fn()
      };

      mockPinoInstance.child.mockReturnValue(mockChildPino);

      const childAdapter = adapter.child({ requestId: 'req-789' });

      childAdapter.handleLog({
        level: ERROR,
        message: 'Child error',
        source: 'ChildService',
        timestamp: new Date(),
        details: { code: 500 }
      });

      expect(mockChildPino.error).toHaveBeenCalledWith(
        {
          source: 'ChildService',
          timestamp: expect.any(Date),
          details: { code: 500 }
        },
        'Child error'
      );
    });

    it('should support nested child loggers', () => {
      const mockChild1 = {
        child: vi.fn(),
        info: vi.fn()
      };
      const mockChild2 = {
        info: vi.fn()
      };

      mockPinoInstance.child.mockReturnValue(mockChild1);
      mockChild1.child.mockReturnValue(mockChild2);

      const child1 = adapter.child({ level1: 'context1' });
      const child2 = child1.child({ level2: 'context2' });

      expect(mockPinoInstance.child).toHaveBeenCalledWith({ level1: 'context1' });
      expect(mockChild1.child).toHaveBeenCalledWith({ level2: 'context2' });
      expect(child2.pino).toBe(mockChild2);
    });
  });

  describe('error serialization', () => {
    it('should serialize error with stack trace in debug mode', async () => {
      // Mock dev environment and debug level
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithLevel = {
        ...mockPinoInstance,
        level: 'debug'
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.err;
      
      expect(serializer).toBeDefined();
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithLevel }, error);
      
      expect(result).toEqual({
        errorChain: [{
          name: 'Error',
          message: 'Test error',
          stack: 'Error: Test error\n    at test.js:1:1'
        }]
      });
    });

    it('should serialize error chain with cause errors', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithLevel = {
        ...mockPinoInstance,
        level: 'debug'
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.err;
      
      const rootCause = new Error('Root cause');
      const middleCause = new Error('Middle cause');
      middleCause.cause = rootCause;
      const mainError = new Error('Main error');
      mainError.cause = middleCause;
      mainError.stack = 'Error: Main error\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithLevel }, mainError);
      
      expect(result).toEqual({
        errorChain: [
          {
            name: 'Error',
            message: 'Main error',
            stack: 'Error: Main error\n    at test.js:1:1'
          },
          {
            name: 'Error',
            message: 'Middle cause'
          },
          {
            name: 'Error',
            message: 'Root cause'
          }
        ]
      });
    });

    it('should not include stack trace in production mode', () => {
      // Use production adapter (dev: false)
      const adapter = new PinoAdapter();
      
      // In production, there should be no serializers configured
      expect(pino).toHaveBeenCalledWith({});
    });

    it('should not include stack trace when not in debug level', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithInfoLevel = {
        ...mockPinoInstance,
        level: 'info'
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithInfoLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.err;
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithInfoLevel }, error);
      
      expect(result).toEqual({
        errorChain: [{
          name: 'Error',
          message: 'Test error'
        }]
      });
    });
  });

  describe('adapter instance reuse', () => {
    it('should reuse pino instance across multiple log calls', () => {
      const events = [
        { level: INFO, message: 'First' },
        { level: WARN, message: 'Second' },
        { level: ERROR, message: 'Third' }
      ].map(e => ({
        ...e,
        source: 'Test',
        timestamp: new Date()
      }));

      events.forEach(event => adapter.handleLog(event));

      expect(mockPinoInstance.info).toHaveBeenCalledTimes(1);
      expect(mockPinoInstance.warn).toHaveBeenCalledTimes(1);
      expect(mockPinoInstance.error).toHaveBeenCalledTimes(1);
      
      // Verify same instance used
      expect(pino).toHaveBeenCalledTimes(1);
    });
  });
});
