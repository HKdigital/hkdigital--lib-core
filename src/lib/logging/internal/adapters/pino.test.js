/**
 * @fileoverview Unit tests for PinoAdapter
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEBUG, INFO, WARN, ERROR } from '$lib/logging/common.js';

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
    it('should create pino instance with default options in production', async () => {
      const adapter = new PinoAdapter();
      await adapter.ready();
      expect(pino).toHaveBeenCalledWith({
        serializers: {
          errors: expect.any(Function)
        }
      });
    });

    it('should create pino instance with custom options', async () => {
      const customOptions = {
        level: 'debug',
        name: 'my-app',
        customField: 'value'
      };
      
      const adapter = new PinoAdapter(customOptions);
      await adapter.ready();
      expect(pino).toHaveBeenCalledWith({
        serializers: {
          errors: expect.any(Function)
        },
        level: 'debug',
        name: 'my-app',
        customField: 'value'
      });
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
      
      const adapter = new PinoAdapterDev();
      await adapter.ready();
      
      expect(pinoDev).toHaveBeenCalledWith(expect.objectContaining({
        serializers: {
          errors: expect.any(Function)
        },
        level: 'debug'
      }), expect.objectContaining({
        write: expect.any(Function)
      }));
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
      
      const adapter = new PinoAdapterDev({ customField: 'custom' });
      await adapter.ready();
      
      expect(pinoDev).toHaveBeenCalledWith(expect.objectContaining({
        serializers: {
          errors: expect.any(Function)
        },
        level: 'debug',
        customField: 'custom'
      }), expect.objectContaining({
        write: expect.any(Function)
      }));
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

    it('should promote error in details to err property for serializer', () => {
      const error = new Error('Test error');
      const logEvent = {
        level: ERROR,
        message: 'Error occurred',
        details: { error, userId: '123', action: 'login' },
        source: 'AuthService',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          source: 'AuthService',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          errors: error,
          details: { userId: '123', action: 'login' }
        },
        'Error occurred'
      );
    });

    it('should handle when details is directly an error', () => {
      const error = new Error('Direct error');
      const logEvent = {
        level: ERROR,
        message: 'Direct error log',
        details: error,
        source: 'DirectService',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          source: 'DirectService',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          errors: error
        },
        'Direct error log'
      );
    });

    it('should handle error with only error property in details', () => {
      const error = new Error('Only error');
      const logEvent = {
        level: ERROR,
        message: 'Error only',
        details: { error },
        source: 'ErrorOnlyService',
        timestamp: new Date('2024-01-01T12:00:00Z')
      };

      adapter.handleLog(logEvent);

      expect(mockPinoInstance.error).toHaveBeenCalledWith(
        {
          source: 'ErrorOnlyService',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          errors: error
        },
        'Error only'
      );
    });
  });

  describe('child method', () => {
    it('should create child logger with context', async () => {
      const mockChildPino = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        child: vi.fn()
      };

      mockPinoInstance.child.mockReturnValue(mockChildPino);

      await adapter.ready();
      
      const context = { requestId: 'req-123', userId: 'user-456' };
      const childAdapter = adapter.child(context);

      expect(mockPinoInstance.child).toHaveBeenCalledWith(context);
      // Test behavior instead of internal state
      await childAdapter.ready();
      expect(childAdapter).toBeInstanceOf(adapter.constructor);
    });

    it('should handle logs from child adapter', async () => {
      const mockChildPino = {
        info: vi.fn(),
        error: vi.fn()
      };

      await adapter.ready();
      mockPinoInstance.child.mockReturnValue(mockChildPino);

      const childAdapter = adapter.child({ requestId: 'req-789' });

      await childAdapter.handleLog({
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

    it('should support nested child loggers', async () => {
      const mockChild1 = {
        child: vi.fn(),
        info: vi.fn()
      };
      const mockChild2 = {
        info: vi.fn()
      };

      await adapter.ready();
      mockPinoInstance.child.mockReturnValue(mockChild1);
      mockChild1.child.mockReturnValue(mockChild2);

      const child1 = adapter.child({ level1: 'context1' });
      const child2 = child1.child({ level2: 'context2' });

      expect(mockPinoInstance.child).toHaveBeenCalledWith({ level1: 'context1' });
      expect(mockChild1.child).toHaveBeenCalledWith({ level2: 'context2' });
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
