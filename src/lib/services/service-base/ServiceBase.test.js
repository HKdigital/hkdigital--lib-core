/**
 * @fileoverview Unit tests for ServiceBase.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceBase } from './ServiceBase.js';
import { DEBUG } from '$lib/logging/index.js';
import {
  STATE_CREATED,
  STATE_CONFIGURING,
  STATE_CONFIGURED,
  STATE_STARTING,
  STATE_RUNNING,
  STATE_STOPPING,
  STATE_STOPPED,
  STATE_DESTROYED,
  STATE_ERROR
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
    it('should configure with correct defaults', () => {
      expect(service.name).toBe('testService');
      expect(service.state).toBe(STATE_CREATED);
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
      vi.spyOn(service, '_configure').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();
    });

    it('should transition through basic lifecycle', async () => {
      const stateChanges = [];
      service.on('stateChanged', (e) => stateChanges.push(e.newState));

      // Initialize
      expect((await service.configure({ test: true })).ok).toBe(true);
      expect(service.state).toBe(STATE_CONFIGURED);
      expect(service._configure).toHaveBeenCalledWith({ test: true }, null);

      // Start
      expect((await service.start()).ok).toBe(true);
      expect(service.state).toBe(STATE_RUNNING);
      expect(service.healthy).toBe(true);

      // Stop
      expect((await service.stop()).ok).toBe(true);
      expect(service.state).toBe(STATE_STOPPED);
      expect(service.healthy).toBe(false);

      // Verify state transitions
      expect(stateChanges).toEqual([
        STATE_CONFIGURING,
        STATE_CONFIGURED,
        STATE_STARTING,
        STATE_RUNNING,
        STATE_STOPPING,
        STATE_STOPPED
      ]);
    });

    it('should handle reconfiguration with oldConfig parameter', async () => {
      vi.spyOn(service, '_configure');

      // Initial configuration
      const initialConfig = { setting1: 'value1' };
      expect((await service.configure(initialConfig)).ok).toBe(true);
      expect(service._configure).toHaveBeenCalledWith(initialConfig, null);

      // Reconfiguration
      const newConfig = { setting1: 'value2', setting2: 'newValue' };
      expect((await service.configure(newConfig)).ok).toBe(true);
      expect(service._configure).toHaveBeenCalledWith(newConfig, initialConfig);

      expect(service._configure).toHaveBeenCalledTimes(2);
    });

    it('should handle live reconfiguration while running', async () => {
      vi.spyOn(service, '_configure');

      // Initial setup and start
      const initialConfig = { setting: 'initial' };
      await service.configure(initialConfig);
      await service.start();
      expect(service.state).toBe(STATE_RUNNING);

      // Live reconfiguration
      const newConfig = { setting: 'updated' };
      expect((await service.configure(newConfig)).ok).toBe(true);
      expect(service.state).toBe(STATE_RUNNING); // Should stay running
      expect(service._configure).toHaveBeenCalledWith(newConfig, initialConfig);
    });

    it('should allow restart from stopped state', async () => {
      await service.configure();
      await service.start();
      await service.stop();

      expect(service.state).toBe(STATE_STOPPED);

      // Should be able to start again
      expect((await service.start()).ok).toBe(true);
      expect(service.state).toBe(STATE_RUNNING);
    });

    it('should prevent invalid state transitions', async () => {
      // Can't start from STATE_CREATED
      expect((await service.start()).ok).toBe(false);
      expect(service.state).toBe(STATE_CREATED);

      // Can't stop from STATE_CONFIGURED
      await service.configure();
      expect((await service.stop()).ok).toBe(true); // Returns true but does nothing
      expect(service.state).toBe(STATE_CONFIGURED);
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const error = new Error('Init failed');
      vi.spyOn(service, '_configure').mockRejectedValue(error);

      const errorEvents = [];
      service.on('error', (e) => errorEvents.push(e));

      expect((await service.configure()).ok).toBe(false);
      expect(service.state).toBe(STATE_ERROR);
      expect(service.error.cause).toBe(error);
      expect(service.healthy).toBe(false);

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]).toMatchObject({
        operation: 'configuration',
        error: expect.objectContaining({
          message: 'configuration failed',
          cause: error
        })
      });
    });

    it('should handle start errors', async () => {
      vi.spyOn(service, '_configure').mockResolvedValue();
      vi.spyOn(service, '_start').mockRejectedValue(new Error('Start failed'));

      await service.configure();
      expect((await service.start()).ok).toBe(false);
      expect(service.state).toBe(STATE_ERROR);
      expect(service.healthy).toBe(false);
    });

    it('should allow stopping from error state', async () => {
      // Get into error state
      vi.spyOn(service, '_configure').mockRejectedValue(new Error('Failed'));
      await service.configure();
      expect(service.state).toBe(STATE_ERROR);

      // Should be able to stop
      vi.spyOn(service, '_stop').mockResolvedValue();
      expect((await service.stop()).ok).toBe(true);
      expect(service.state).toBe(STATE_STOPPED);
    });
  });

  describe('Recovery', () => {
    beforeEach(async () => {
      // Get service into error state
      vi.spyOn(service, '_configure').mockRejectedValue(new Error('Failed'));
      await service.configure();
      expect(service.state).toBe(STATE_ERROR);
    });

    it('should recover using custom _recover method', async () => {
      vi.spyOn(service, '_recover').mockResolvedValue();

      expect((await service.recover()).ok).toBe(true);
      expect(service._recover).toHaveBeenCalled();
      expect(service.state).toBe(STATE_RUNNING);
      expect(service.healthy).toBe(true);
      expect(service.error).toBeNull();
    });

    it('should recover using restart when no _recover method', async () => {
      // Reset the service to test default recovery
      service = new ServiceBase('testService');

      // Setup all mocks for successful operation
      vi.spyOn(service, '_configure').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();

      // Initialize and start service successfully
      await service.configure();
      await service.start();
      expect(service.state).toBe(STATE_RUNNING);

      // Force error state manually
      service.state = STATE_ERROR;
      service.healthy = false;
      service.error = new Error('Some error');

      // Now test recovery - it should stop then start
      expect((await service.recover()).ok).toBe(true);
      expect(service.state).toBe(STATE_RUNNING);
      expect(service.healthy).toBe(true);
      expect(service.error).toBeNull();
    });

    it('should handle recovery failures', async () => {
      vi.spyOn(service, '_recover').mockRejectedValue(
        new Error('Recovery failed')
      );

      expect((await service.recover()).ok).toBe(false);
      expect(service.state).toBe(STATE_ERROR);
      expect(service.error.message).toBe('recovery failed');
    });

    it('should only recover from STATE_ERROR state', async () => {
      // Get to running state
      service.state = STATE_RUNNING;
      service.error = null;

      expect((await service.recover()).ok).toBe(false);
      expect(service.state).toBe(STATE_RUNNING);
    });
  });

  describe('Health Monitoring', () => {
    it('should emit healthChanged events', async () => {
      vi.spyOn(service, '_configure').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();

      const healthEvents = [];
      service.on('healthChanged', (e) => healthEvents.push(e));

      await service.configure();
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
        state: STATE_CREATED,
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
      vi.spyOn(service, '_healthCheck').mockRejectedValue(
        new Error('Check failed')
      );

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
      vi.spyOn(service, '_stop').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Get to running state
      service.state = STATE_RUNNING;

      // Start stop
      const stopPromise = service.stop();

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(1100);

      expect((await stopPromise).ok).toBe(false);
      expect(service.state).toBe(STATE_ERROR);
      expect(service.error.message).toBe('shutdown failed');
    });

    it('should force shutdown when requested', async () => {
      service = new ServiceBase('test', { shutdownTimeout: 1000 });

      // Make stop hang
      vi.spyOn(service, '_stop').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      service.state = STATE_RUNNING;

      const stopPromise = service.stop({ force: true, timeout: 100 });
      await vi.advanceTimersByTimeAsync(150);

      expect((await stopPromise).ok).toBe(true);
      expect(service.state).toBe(STATE_STOPPED);
    });
  });

  describe('Cleanup', () => {
    it('should clean up on destroy', async () => {
      const removeListenersSpy = vi.spyOn(service, 'removeAllListeners');
      const loggerRemoveSpy = vi.spyOn(service.logger, 'removeAllListeners');

      await service.destroy();

      expect(service.state).toBe(STATE_DESTROYED);
      expect(removeListenersSpy).toHaveBeenCalled();
      expect(loggerRemoveSpy).toHaveBeenCalled();
    });

    it('should stop before destroying if running', async () => {
      vi.spyOn(service, '_configure').mockResolvedValue();
      vi.spyOn(service, '_start').mockResolvedValue();
      vi.spyOn(service, '_stop').mockResolvedValue();

      await service.configure();
      await service.start();

      expect(service.state).toBe(STATE_RUNNING);

      await service.destroy();

      expect(service._stop).toHaveBeenCalled();
      expect(service.state).toBe(STATE_DESTROYED);
    });
  });

  describe('Configuration Access', () => {
    it('should return empty object for lastConfig when never configured', () => {
      expect(service.lastConfig).toEqual({});
    });

    it('should return a copy of the last applied configuration', async () => {
      vi.spyOn(service, '_configure').mockResolvedValue();

      const config1 = { setting: 'value1' };
      await service.configure(config1);
      expect(service.lastConfig).toEqual(config1);
      // Should return a copy, not the same reference
      expect(service.lastConfig).not.toBe(config1);

      const config2 = { setting: 'value2', newSetting: 'newValue' };
      await service.configure(config2);
      expect(service.lastConfig).toEqual(config2);
      expect(service.lastConfig).not.toBe(config2);
    });

    it('should preserve lastConfig even after configuration errors', async () => {
      vi.spyOn(service, '_configure')
        .mockResolvedValueOnce() // First call succeeds
        .mockRejectedValueOnce(new Error('Config failed')); // Second fails

      const initialConfig = { setting: 'initial' };
      await service.configure(initialConfig);
      expect(service.lastConfig).toEqual(initialConfig);

      // This should fail but not change lastConfig
      await service.configure({ setting: 'failed' });
      expect(service.state).toBe(STATE_ERROR);
      expect(service.lastConfig).toEqual(initialConfig); // Should remain unchanged
    });

    it('should return immutable copy preventing external modification', async () => {
      vi.spyOn(service, '_configure').mockResolvedValue();

      const originalConfig = { setting: 'original', nested: { value: 1 } };
      await service.configure(originalConfig);

      const retrievedConfig = service.lastConfig;
      retrievedConfig.setting = 'modified';
      retrievedConfig.nested.value = 999;

      // Original lastConfig should remain unchanged
      expect(service.lastConfig).toEqual(originalConfig);
      expect(service.lastConfig.setting).toBe('original');
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
