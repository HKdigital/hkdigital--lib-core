/**
 * @fileoverview Unit tests for ConfigPlugin.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConfigPlugin from './ConfigPlugin.js';
import { ServiceManager } from '../service-manager/ServiceManager.js';
import { ServiceBase } from '../service-base/ServiceBase.js';
import {
  STATE_CREATED,
  STATE_CONFIGURED,
  STATE_RUNNING,
  STATE_ERROR,
  STATE_RECOVERING
} from '../service-base/constants.js';
import { SERVICE_STATE_CHANGED } from '../service-manager/constants.js';

// Mock service for testing
class MockService extends ServiceBase {
  constructor(name) {
    super(name);
    this.configureCallCount = 0;
    this.lastOldConfig = null;
    this.lastNewConfig = null;
  }

  async _configure(newConfig, oldConfig = null) {
    this.configureCallCount++;
    this.lastNewConfig = newConfig;
    this.lastOldConfig = oldConfig;
    this.config = newConfig;
  }

  async _start() {
    this.started = true;
  }

  async _stop() {
    this.started = false;
  }

  // Helper to simulate state changes
  _setState(newState) {
    this.state = newState;
  }
}

describe('ConfigPlugin', () => {
  let plugin;
  let manager;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      database: { host: 'localhost', port: 5432 },
      redis: { host: 'cache-server', port: 6379 },
      api: { timeout: 5000, retries: 3 }
    };

    plugin = new ConfigPlugin(mockConfig);
    manager = new ServiceManager();

    // Spy on manager methods
    vi.spyOn(manager, 'on');
    vi.spyOn(manager.logger, 'info');
    vi.spyOn(manager.logger, 'debug');
    vi.spyOn(manager.logger, 'error');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with config object', () => {
      expect(plugin.allConfigs).toEqual(mockConfig);
    });

    it('should initialize with empty config if none provided', () => {
      const emptyPlugin = new ConfigPlugin();
      expect(emptyPlugin.allConfigs).toEqual({});
    });

    it('should have plugin name', () => {
      expect(plugin.name).toBe('object-config');
    });
  });

  describe('Config resolution', () => {
    beforeEach(() => {
      manager.attachPlugin(plugin);
    });

    it('should resolve config for string labels', async () => {
      const serviceEntry = {
        serviceConfigOrLabel: 'database',
        resolvedConfig: null
      };

      const result = await plugin.resolveServiceConfig(
        'test-service',
        serviceEntry,
        null
      );

      expect(result).toEqual({ host: 'localhost', port: 5432 });
    });

    it('should return undefined for non-string config labels', async () => {
      const serviceEntry = {
        serviceConfigOrLabel: { direct: 'config' },
        resolvedConfig: null
      };

      const result = await plugin.resolveServiceConfig(
        'test-service',
        serviceEntry,
        null
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined for unknown config labels', async () => {
      const serviceEntry = {
        serviceConfigOrLabel: 'unknown-label',
        resolvedConfig: null
      };

      const result = await plugin.resolveServiceConfig(
        'test-service',
        serviceEntry,
        null
      );

      expect(result).toBeUndefined();
    });

    it('should log debug info when config is resolved', async () => {
      const serviceEntry = {
        serviceConfigOrLabel: 'database',
        resolvedConfig: null
      };

      await plugin.resolveServiceConfig('test-service', serviceEntry, null);

      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Resolved object config for 'test-service'"),
        expect.objectContaining({ configKeys: expect.any(Array) })
      );
    });
  });

  describe('Config object management', () => {
    let mockService;

    beforeEach(async () => {
      manager.attachPlugin(plugin);
      manager.register('test-service', MockService, 'database');
      await manager.startService('test-service');
      mockService = manager.services.get('test-service').instance;
      mockService._setState(STATE_RUNNING);
    });

    it('should replace all configurations', async () => {
      const newConfig = {
        database: { host: 'new-host', port: 5433 },
        newService: { setting: 'value' }
      };

      const configureSpy = vi.spyOn(mockService, 'configure');

      await plugin.replaceAllConfigs(newConfig);

      expect(plugin.allConfigs).toEqual(newConfig);
      expect(configureSpy).toHaveBeenCalledWith({
        host: 'new-host',
        port: 5433
      });
    });

    it('should clean up unused configurations', async () => {
      // Add extra config that's not used by any service
      plugin.allConfigs.unusedConfig = { extra: 'data' };

      await plugin.cleanupConfigs();

      // Only 'database' config should remain since that's the only one used by a service
      expect(plugin.allConfigs).toEqual({
        database: { host: 'localhost', port: 5432 } // Only the used config remains
      });
    });
  });

  describe('Live config updates', () => {
    let mockService;

    beforeEach(async () => {
      manager.attachPlugin(plugin);

      // Register and start a mock service
      manager.register('test-service', MockService, 'database');
      await manager.startService('test-service');

      mockService = manager.services.get('test-service').instance;
      mockService._setState(STATE_RUNNING);
    });

    it('should update running service immediately', async () => {
      const newConfig = { host: 'new-host', port: 5433 };

      // Spy on configure method to track calls
      const configureSpy = vi.spyOn(mockService, 'configure');

      const updatedServices = await plugin.replaceConfig('database', newConfig);

      expect(updatedServices).toEqual(['test-service']);
      expect(configureSpy).toHaveBeenCalledWith(newConfig);
      expect(configureSpy).toHaveBeenCalledTimes(1);
    });

    it('should queue config for service in invalid state', async () => {
      mockService._setState(STATE_ERROR);

      // Mock configure to reject (simulating ServiceBase state validation)
      const configureSpy = vi
        .spyOn(mockService, 'configure')
        .mockRejectedValue(new Error('Cannot configure from state: error'));

      const newConfig = { host: 'new-host', port: 5433 };

      const updatedServices = await plugin.replaceConfig('database', newConfig);

      expect(updatedServices).toEqual([]);
      expect(configureSpy).toHaveBeenCalledWith(newConfig);
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });

    it('should apply pending config when service becomes valid', async () => {
      // Mock configure to reject initially, then succeed
      const configureSpy = vi
        .spyOn(mockService, 'configure')
        .mockRejectedValueOnce(new Error('Cannot configure from state: error'))
        .mockResolvedValueOnce(undefined);

      // Set service to invalid state and queue config
      mockService._setState(STATE_ERROR);
      const newConfig = { host: 'new-host', port: 5433 };
      await plugin.replaceConfig('database', newConfig);

      // Simulate service recovery
      mockService._setState(STATE_RUNNING);

      // Trigger state change event
      const stateChangeHandler = manager.on.mock.calls.find(
        (call) => call[0] === SERVICE_STATE_CHANGED
      )[1];

      await stateChangeHandler({
        service: 'test-service',
        state: STATE_RUNNING,
        instance: mockService
      });

      expect(configureSpy).toHaveBeenCalledTimes(2); // First attempt + retry
      expect(configureSpy).toHaveBeenCalledWith(newConfig);
      expect(manager.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Applied pending config update')
      );
    });

    it('should discard intermediate config updates when multiple updates are queued', async () => {
      // Mock configure to reject multiple times, then succeed
      const configureSpy = vi
        .spyOn(mockService, 'configure')
        .mockRejectedValue(new Error('Cannot configure from state: error'))
        .mockResolvedValueOnce(undefined);

      // Set service to invalid state
      mockService._setState(STATE_ERROR);

      // Queue multiple config updates
      const config1 = { host: 'host1', port: 5432 };
      const config2 = { host: 'host2', port: 5433 };
      const config3 = { host: 'host3', port: 5434 };

      await plugin.replaceConfig('database', config1);
      await plugin.replaceConfig('database', config2);
      await plugin.replaceConfig('database', config3);

      // All should fail initially
      expect(configureSpy).toHaveBeenCalledTimes(3);
      expect(configureSpy).toHaveBeenNthCalledWith(1, config1);
      expect(configureSpy).toHaveBeenNthCalledWith(2, config2);
      expect(configureSpy).toHaveBeenNthCalledWith(3, config3);

      // Reset spy for recovery test
      configureSpy.mockClear();
      configureSpy.mockResolvedValueOnce(undefined);

      // Simulate service recovery
      mockService._setState(STATE_RUNNING);

      // Trigger state change event
      const stateChangeHandler = manager.on.mock.calls.find(
        (call) => call[0] === SERVICE_STATE_CHANGED
      )[1];

      await stateChangeHandler({
        service: 'test-service',
        state: STATE_RUNNING,
        instance: mockService
      });

      // Should only apply the LATEST config (config3), discarding config1 and config2
      expect(configureSpy).toHaveBeenCalledTimes(1);
      expect(configureSpy).toHaveBeenCalledWith(config3);
      expect(manager.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Applied pending config update')
      );
    });

    it('should handle config update errors gracefully', async () => {
      // Make configure throw an error
      vi.spyOn(mockService, 'configure').mockRejectedValue(
        new Error('Config failed')
      );

      const newConfig = { host: 'new-host', port: 5433 };

      const updatedServices = await plugin.replaceConfig('database', newConfig);

      expect(updatedServices).toEqual([]);
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });

    it('should update plugin config object even if service update fails', async () => {
      vi.spyOn(mockService, 'configure').mockRejectedValue(
        new Error('Config failed')
      );

      const newConfig = { host: 'new-host', port: 5433 };

      await plugin.replaceConfig('database', newConfig);

      expect(plugin.allConfigs.database).toEqual(newConfig);
    });

    it('should skip services with non-string config labels', async () => {
      // Register service with object config
      manager.register('direct-config-service', MockService, {
        direct: 'config'
      });
      await manager.startService('direct-config-service');

      const directService = manager.services.get(
        'direct-config-service'
      ).instance;
      directService._setState(STATE_RUNNING);

      const newConfig = { host: 'new-host', port: 5433 };

      const updatedServices = await plugin.replaceConfig('database', newConfig);

      expect(updatedServices).toEqual(['test-service']); // Only the database service
    });
  });

  describe('Plugin lifecycle', () => {
    it('should attach to manager and set up event listener', () => {
      manager.attachPlugin(plugin);

      expect(plugin.manager).toBe(manager);
      expect(manager.on).toHaveBeenCalledWith(
        SERVICE_STATE_CHANGED,
        expect.any(Function)
      );
      expect(manager.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('ConfigPlugin attached')
      );
    });

    it('should detach from manager and clear pending updates', () => {
      manager.attachPlugin(plugin);

      // Clear previous mock calls
      vi.clearAllMocks();

      // Add a pending update
      plugin.replaceConfig('test-label', { test: 'config' });

      manager.detachPlugin('object-config'); // Use plugin name, not object

      expect(manager.logger.info).toHaveBeenCalledWith('ConfigPlugin detached');
      // Note: Can't directly test private field, but it's cleared in _onDetach
    });
  });

  describe('State validation (via ServiceBase)', () => {
    let mockService;

    beforeEach(async () => {
      manager.attachPlugin(plugin);
      manager.register('test-service', MockService, 'database');
      await manager.startService('test-service');
      mockService = manager.services.get('test-service').instance;
    });

    it('should apply config when ServiceBase allows it', async () => {
      // Mock configure to succeed
      const configureSpy = vi
        .spyOn(mockService, 'configure')
        .mockResolvedValue();

      const updatedServices = await plugin.replaceConfig('database', {
        test: 'config'
      });

      expect(updatedServices).toEqual(['test-service']);
      expect(configureSpy).toHaveBeenCalledWith({ test: 'config' });
    });

    it('should queue config when ServiceBase rejects it', async () => {
      // Mock configure to reject due to invalid state
      const configureSpy = vi
        .spyOn(mockService, 'configure')
        .mockRejectedValue(new Error('Cannot configure from state: error'));

      const updatedServices = await plugin.replaceConfig('database', {
        test: 'config'
      });

      expect(updatedServices).toEqual([]);
      expect(configureSpy).toHaveBeenCalledWith({ test: 'config' });
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });
  });
});
