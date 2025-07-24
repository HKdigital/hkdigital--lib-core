/**
 * @fileoverview Unit tests for ServiceBase.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceBase } from './ServiceBase.js';
import { DEBUG } from '$lib/logging/internal/unified-logger';
import {
  CREATED,
  INITIALIZING,
  INITIALIZED,
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
  DESTROYED,
  ERROR
} from './constants.js';

describe('ServiceBase', () => {
  let service;

  beforeEach(() => {
    service = new ServiceBase('testService');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct defaults', () => {
      expect(service.name).toBe('testService');
      expect(service.state).toBe(CREATED);
      expect(service.healthy).toBe(false);
      expect(service.error).toBeNull();
      expect(service.logger).toBeDefined();
    });

    it('should accept constructor options', () => {
      const customService = new ServiceBase('custom', {
        logLevel: DEBUG,
        shutdownTimeout: 3000
      });
      
      expect(customService._shutdownTimeout).toBe(3000);
      // Logger level is set internally
    });
  });

  describe('Lifecycle Management', () => {
    beforeEach(() => {
      // Mock protected methods
      vi.spyOn(service, '_init').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();
    });

    it('should transition through basic lifecycle', async () => {
      const stateChanges = [];
      service.on('stateChanged', (e) => stateChanges.push(e.newState));

      // Initialize
      expect(await service.initialize({ test: true })).toBe(true);
      expect(service.state).toBe(INITIALIZED);
      expect(service._init).toHaveBeenCalledWith({ test: true });

      // Start
      expect(await service.start()).toBe(true);
      expect(service.state).toBe(RUNNING);
      expect(service.healthy).toBe(true);

      // Stop
      expect(await service.stop()).toBe(true);
      expect(service.state).toBe(STOPPED);
      expect(service.healthy).toBe(false);

      // Verify state transitions
      expect(stateChanges).toEqual([
        INITIALIZING, INITIALIZED,
        STARTING, RUNNING,
        STOPPING, STOPPED
      ]);
    });

    it('should allow restart from stopped state', async () => {
      await service.initialize();
      await service.start();
      await service.stop();
      
      expect(service.state).toBe(STOPPED);
      
      // Should be able to start again
      expect(await service.start()).toBe(true);
      expect(service.state).toBe(RUNNING);
    });

    it('should prevent invalid state transitions', async () => {
      // Can't start from CREATED
      expect(await service.start()).toBe(false);
      expect(service.state).toBe(CREATED);
      
      // Can't stop from INITIALIZED
      await service.initialize();
      expect(await service.stop()).toBe(true); // Returns true but does nothing
      expect(service.state).toBe(INITIALIZED);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const error = new Error('Init failed');
      vi.spyOn(service, '_init').mockRejectedValue(error);

      const errorEvents = [];
      service.on('error', (e) => errorEvents.push(e));

      expect(await service.initialize()).toBe(false);
      expect(service.state).toBe(ERROR);
      expect(service.error).toBe(error);
      expect(service.healthy).toBe(false);

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]).toMatchObject({
        operation: 'initialization',
        error
      });
    });

    it('should handle start errors', async () => {
      vi.spyOn(service, '_init').mockResolvedValue();
      vi.spyOn(service, '_start').mockRejectedValue(new Error('Start failed'));

      await service.initialize();
      expect(await service.start()).toBe(false);
      expect(service.state).toBe(ERROR);
      expect(service.healthy).toBe(false);
    });

    it('should allow stopping from error state', async () => {
      // Get into error state
      vi.spyOn(service, '_init').mockRejectedValue(new Error('Failed'));
      await service.initialize();
      expect(service.state).toBe(ERROR);

      // Should be able to stop
      vi.spyOn(service, '_stop').mockResolvedValue();
      expect(await service.stop()).toBe(true);
      expect(service.state).toBe(STOPPED);
    });
  });

  describe('Recovery', () => {
    beforeEach(async () => {
      // Get service into error state
      vi.spyOn(service, '_init').mockRejectedValue(new Error('Failed'));
      await service.initialize();
      expect(service.state).toBe(ERROR);
    });

    it('should recover using custom _recover method', async () => {
      vi.spyOn(service, '_recover').mockResolvedValue();

      expect(await service.recover()).toBe(true);
      expect(service._recover).toHaveBeenCalled();
      expect(service.state).toBe(RUNNING);
      expect(service.healthy).toBe(true);
      expect(service.error).toBeNull();
    });

    it('should recover using restart when no _recover method', async () => {
      // Reset the service to test default recovery
      service = new ServiceBase('testService');

      // Setup all mocks for successful operation
      vi.spyOn(service, '_init').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();

      // Initialize and start service successfully
      await service.initialize();
      await service.start();
      expect(service.state).toBe(RUNNING);

      // Force error state manually
      service.state = ERROR;
      service.healthy = false;
      service.error = new Error('Some error');

      // Now test recovery - it should stop then start
      expect(await service.recover()).toBe(true);
      expect(service.state).toBe(RUNNING);
      expect(service.healthy).toBe(true);
      expect(service.error).toBeNull();
    });

    it('should handle recovery failures', async () => {
      vi.spyOn(service, '_recover').mockRejectedValue(new Error('Recovery failed'));

      expect(await service.recover()).toBe(false);
      expect(service.state).toBe(ERROR);
      expect(service.error.message).toBe('Recovery failed');
    });

    it('should only recover from ERROR state', async () => {
      // Get to running state
      service.state = RUNNING;
      service.error = null;

      expect(await service.recover()).toBe(false);
      expect(service.state).toBe(RUNNING);
    });
  });

  describe('Health Monitoring', () => {
    it('should emit healthChanged events', async () => {
      vi.spyOn(service, '_init').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();

      const healthEvents = [];
      service.on('healthChanged', (e) => healthEvents.push(e));

      await service.initialize();
      expect(healthEvents).toHaveLength(0); // No change yet

      await service.start();
      expect(healthEvents).toHaveLength(1);
      expect(healthEvents[0]).toEqual({
        healthy: true,
        wasHealthy: false
      });
    });

    it('should provide basic health status', async () => {
      const health = await service.getHealth();
      
      expect(health).toEqual({
        name: 'testService',
        state: CREATED,
        healthy: false,
        error: undefined
      });
    });

    it('should include custom health check data', async () => {
      vi.spyOn(service, '_healthCheck').mockResolvedValue({
        latency: 10,
        connections: 5
      });

      const health = await service.getHealth();
      
      expect(health).toMatchObject({
        name: 'testService',
        latency: 10,
        connections: 5
      });
    });

    it('should handle health check errors', async () => {
      vi.spyOn(service, '_healthCheck').mockRejectedValue(new Error('Check failed'));

      const health = await service.getHealth();
      
      expect(health).toMatchObject({
        healthy: false,
        checkError: 'Check failed'
      });
    });
  });

  describe('Graceful Shutdown', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should respect shutdown timeout', async () => {
      // Create service with short timeout
      service = new ServiceBase('test', { shutdownTimeout: 1000 });
      
      // Make stop hang
      vi.spyOn(service, '_stop').mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      // Get to running state
      service.state = RUNNING;

      // Start stop
      const stopPromise = service.stop();
      
      // Advance past timeout
      await vi.advanceTimersByTimeAsync(1100);

      expect(await stopPromise).toBe(false);
      expect(service.state).toBe(ERROR);
      expect(service.error.message).toBe('Shutdown timeout');
    });

    it('should force shutdown when requested', async () => {
      service = new ServiceBase('test', { shutdownTimeout: 1000 });
      
      // Make stop hang
      vi.spyOn(service, '_stop').mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      service.state = RUNNING;

      const stopPromise = service.stop({ force: true, timeout: 100 });
      await vi.advanceTimersByTimeAsync(150);

      expect(await stopPromise).toBe(true);
      expect(service.state).toBe(STOPPED);
    });
  });

  describe('Cleanup', () => {
    it('should clean up on destroy', async () => {
      const removeListenersSpy = vi.spyOn(service, 'removeAllListeners');
      const loggerRemoveSpy = vi.spyOn(service.logger, 'removeAllListeners');

      await service.destroy();

      expect(service.state).toBe(DESTROYED);
      expect(removeListenersSpy).toHaveBeenCalled();
      expect(loggerRemoveSpy).toHaveBeenCalled();
    });

    it('should stop before destroying if running', async () => {
      vi.spyOn(service, '_init').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();

      await service.initialize();
      await service.start();
      
      expect(service.state).toBe(RUNNING);

      await service.destroy();
      
      expect(service._stop).toHaveBeenCalled();
      expect(service.state).toBe(DESTROYED);
    });
  });

  describe('Logging', () => {
    it('should allow changing log level', () => {
      const spy = vi.spyOn(service.logger, 'setLevel');
      
      expect(service.setLogLevel(DEBUG)).toBe(true);
      expect(spy).toHaveBeenCalledWith(DEBUG);
    });
  });
});
