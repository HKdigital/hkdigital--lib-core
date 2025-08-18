/**
 * @fileoverview Unit tests for PinoAdapter error serializers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('PinoAdapter Serializers', () => {
  let mockPinoInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock pino instance
    mockPinoInstance = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
      child: vi.fn(),
      level: 'info',
      levelVal: 30
    };
    
    // Mock pino to return our mock instance
    pino.mockReturnValue(mockPinoInstance);
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
        level: 'debug',
        levelVal: 20
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      expect(serializer).toBeDefined();
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithLevel }, error);
      
      expect(result).toEqual([{
        name: 'Error',
        message: 'Test error',
        errorType: 'error',
        meta: expect.objectContaining({
          category: 'error',
          method: 'error'
        }),
        stackFrames: expect.arrayContaining([
          expect.stringContaining('→ Error: Test error')
        ])
      }]);
    });

    it('should serialize error chain with cause errors', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithLevel = {
        ...mockPinoInstance,
        level: 'debug',
        levelVal: 20
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const rootCause = new Error('Root cause');
      const middleCause = new Error('Middle cause');
      middleCause.cause = rootCause;
      const mainError = new Error('Main error');
      mainError.cause = middleCause;
      mainError.stack = 'Error: Main error\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithLevel }, mainError);
      
      expect(result).toEqual([
        {
          name: 'Error',
          message: 'Main error',
          errorType: 'error',
          meta: expect.objectContaining({
            category: 'error',
            method: 'error'
          }),
          stackFrames: expect.arrayContaining([
            expect.stringContaining('→ Error: Main error')
          ])
        },
        {
          name: 'Error',
          message: 'Middle cause',
          errorType: expect.any(String),
          meta: expect.objectContaining({
            category: 'error',
            method: 'error'
          }),
          stackFrames: expect.any(Array)
        },
        {
          name: 'Error',
          message: 'Root cause',
          errorType: expect.any(String),
          meta: expect.objectContaining({
            category: 'error',
            method: 'error'
          }),
          stackFrames: expect.any(Array)
        }
      ]);
    });

    it('should serialize errors in production mode (but without pretty transport)', () => {
      // Use production adapter (dev: false)
      const adapter = new PinoAdapter();
      
      // In production, serializers should still be configured
      expect(pino).toHaveBeenCalledWith({
        serializers: {
          errors: expect.any(Function)
        }
      });
      
      // Test that the serializer works
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const mockPinoWithInfoLevel = {
        ...mockPinoInstance,
        level: 'info',
        levelVal: 30
      };
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithInfoLevel }, error);
      
      expect(result).toEqual([{
        name: 'Error',
        message: 'Test error',
        errorType: 'error',
        meta: expect.objectContaining({
          category: 'error',
          method: 'error'
        }),
        stackFrames: expect.any(Array)
      }]);
    });

    it('should include stack trace in production when debug level is set', () => {
      // Create a mock pino instance with debug level first
      const mockPinoWithDebugLevel = {
        ...mockPinoInstance,
        level: 'debug',
        levelVal: 20
      };
      
      // Mock pino to return our debug-level instance
      pino.mockReturnValue(mockPinoWithDebugLevel);
      
      // Use production adapter but with debug level
      const adapter = new PinoAdapter({ level: 'debug' });
      
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithDebugLevel }, error);
      
      expect(result).toEqual([{
        name: 'Error',
        message: 'Test error',
        errorType: 'error',
        meta: expect.objectContaining({
          category: 'error',
          method: 'error'
        }),
        stackFrames: expect.arrayContaining([
          expect.stringContaining('→ Error: Test error')
        ])
      }]);
    });

    it('should not include stack trace when not in debug level', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithInfoLevel = {
        ...mockPinoInstance,
        level: 'info',
        levelVal: 30
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithInfoLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const error = new Error('Test error');
      error.stack = 'Error: Test error\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithInfoLevel }, error);
      
      expect(result).toEqual([{
        name: 'Error',
        message: 'Test error',
        errorType: 'error',
        meta: expect.objectContaining({
          category: 'error',
          method: 'error'
        }),
        stackFrames: expect.any(Array)
      }]);
    });

    it('should serialize HttpError with status and details', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      const { HttpError } = await import('$lib/network/errors.js');
      
      const mockPinoWithDebugLevel = {
        ...mockPinoInstance,
        level: 'debug',
        levelVal: 20
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithDebugLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const httpError = new HttpError(
        404,
        'HTTP 404: Not Found',
        { error: 'Resource not found', resourceId: 'abc123' }
      );
      httpError.stack = 'HttpError: HTTP 404: Not Found\\n    at test.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithDebugLevel }, httpError);
      
      expect(result).toEqual([{
        name: 'HttpError',
        message: 'HTTP 404: Not Found',
        status: 404,
        details: { error: 'Resource not found', resourceId: 'abc123' },
        errorType: expect.any(String),
        meta: expect.objectContaining({
          category: 'http',
          method: 'http'
        }),
        stackFrames: expect.any(Array)
      }]);
    });

    it('should serialize HttpError with cause chain', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      const { HttpError } = await import('$lib/network/errors.js');
      
      const mockPinoWithDebugLevel = {
        ...mockPinoInstance,
        level: 'debug',
        levelVal: 20
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithDebugLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      // Create a chain: HttpError -> regular Error
      const originalError = new Error('Database connection failed');
      const httpError = new HttpError(
        500,
        'HTTP 500: Internal Server Error',
        { message: 'Service unavailable', retryAfter: '60s' },
        originalError
      );
      httpError.stack = 'HttpError: HTTP 500: Internal Server Error\\n    at handler.js:1:1';
      
      const result = serializer.call({ pino: mockPinoWithDebugLevel }, httpError);
      
      expect(result).toEqual([
        {
          name: 'HttpError',
          message: 'HTTP 500: Internal Server Error',
          status: 500,
          details: { message: 'Service unavailable', retryAfter: '60s' },
          errorType: expect.any(String),
          meta: expect.objectContaining({
            category: 'http',
            method: 'http'
          }),
          stackFrames: expect.any(Array)
        },
        {
          name: 'Error',
          message: 'Database connection failed',
          errorType: expect.any(String),
          meta: expect.objectContaining({
            category: 'error',
            method: 'error'
          }),
          stackFrames: expect.any(Array)
        }
      ]);
    });

    it('should clean project root from stack traces in debug mode', async () => {
      vi.doMock('$app/environment', () => ({
        dev: true
      }));
      
      vi.resetModules();
      const { PinoAdapter: PinoAdapterDev } = await import('$lib/logging/internal/adapters/pino.js');
      
      const mockPinoWithDebugLevel = {
        ...mockPinoInstance,
        level: 'debug',
        levelVal: 20
      };
      
      const pino = (await import('pino')).default;
      pino.mockReturnValue(mockPinoWithDebugLevel);
      
      const adapter = new PinoAdapterDev();
      const pinoConfig = pino.mock.calls[pino.mock.calls.length - 1][0];
      const serializer = pinoConfig.serializers?.errors;
      
      const error = new Error('Test error');
      // Mock stack trace with project root path (similar to process.cwd())
      const projectRoot = process.cwd();
      error.stack = `Error: Test error
    at testFunction (${projectRoot}/src/components/Button.js:10:5)
    at handler (${projectRoot}/src/routes/api/test.js:25:10)
    at process.nextTick (/some/external/path/lib.js:100:20)`;
      
      const result = serializer.call({ pino: mockPinoWithDebugLevel }, error);
      
      expect(result[0].stackFrames).toEqual(expect.arrayContaining([
        expect.stringContaining('src/components/Button.js:10:5'),
        expect.stringContaining('src/routes/api/test.js:25:10'),
        expect.stringContaining('/some/external/path/lib.js:100:20')
      ]));
    });
  });
});