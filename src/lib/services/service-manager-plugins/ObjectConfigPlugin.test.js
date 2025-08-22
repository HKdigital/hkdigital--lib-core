/**
 * @fileoverview Unit tests for ObjectConfigPlugin.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ObjectConfigPlugin from './ObjectConfigPlugin.js';
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

describe('ObjectConfigPlugin', () => {
  let plugin;
  let manager;
  let mockConfig;

  beforeEach(() => {
    mockConfig = {
      database: { host: 'localhost', port: 5432 },
      redis: { host: 'cache-server', port: 6379 },
      api: { timeout: 5000, retries: 3 }
    };

    plugin = new ObjectConfigPlugin(mockConfig);
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
      expect(plugin.configObject).toEqual(mockConfig);
    });

    it('should initialize with empty config if none provided', () => {
      const emptyPlugin = new ObjectConfigPlugin();
      expect(emptyPlugin.configObject).toEqual({});
    });

    it('should have plugin name', () => {
      expect(plugin.name).toBe('object-config');
    });
  });

  describe('Config Resolution', () => {
    beforeEach(() => {
      manager.attachPlugin(plugin);
    });

    it('should resolve config for string labels', async () => {
      const serviceEntry = {
        config: 'database',
        resolvedConfig: null
      };

      const result = await plugin._getServiceConfig('test-service', serviceEntry, null);
      
      expect(result).toEqual({ host: 'localhost', port: 5432 });
    });

    it('should return undefined for non-string config labels', async () => {
      const serviceEntry = {
        config: { direct: 'config' },
        resolvedConfig: null
      };

      const result = await plugin._getServiceConfig('test-service', serviceEntry, null);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for unknown config labels', async () => {
      const serviceEntry = {
        config: 'unknown-label',
        resolvedConfig: null
      };

      const result = await plugin._getServiceConfig('test-service', serviceEntry, null);
      
      expect(result).toBeUndefined();
    });

    it('should log debug info when config is resolved', async () => {
      const serviceEntry = {
        config: 'database',
        resolvedConfig: null
      };

      await plugin._getServiceConfig('test-service', serviceEntry, null);
      
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining("Resolved object config for 'test-service'"),
        expect.objectContaining({ configKeys: expect.any(Array) })
      );
    });
  });

  describe('Config Object Management', () => {
    it('should update config object', () => {
      const newConfig = { newService: { setting: 'value' } };
      
      plugin.updateConfigObject(newConfig);
      
      expect(plugin.configObject).toEqual(newConfig);
    });

    it('should merge additional config', () => {
      const additionalConfig = { newService: { setting: 'value' } };
      
      plugin.mergeConfig(additionalConfig);
      
      expect(plugin.configObject).toEqual({
        ...mockConfig,
        ...additionalConfig
      });
    });

    it('should return copy of config object', () => {
      const configCopy = plugin.getConfigObject();
      
      expect(configCopy).toEqual(mockConfig);
      expect(configCopy).not.toBe(mockConfig); // Should be a copy
    });
  });

  describe('Live Config Updates', () => {
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
      
      const updatedServices = await plugin.updateConfigLabel('database', newConfig);
      
      expect(updatedServices).toEqual(['test-service']);
      expect(configureSpy).toHaveBeenCalledWith(newConfig);
      expect(configureSpy).toHaveBeenCalledTimes(1);
    });

    it('should queue config for service in invalid state', async () => {
      mockService._setState(STATE_ERROR);
      
      // Mock configure to reject (simulating ServiceBase state validation)
      const configureSpy = vi.spyOn(mockService, 'configure')
        .mockRejectedValue(new Error('Cannot configure from state: error'));
      
      const newConfig = { host: 'new-host', port: 5433 };
      
      const updatedServices = await plugin.updateConfigLabel('database', newConfig);
      
      expect(updatedServices).toEqual([]);
      expect(configureSpy).toHaveBeenCalledWith(newConfig);
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });

    it('should apply pending config when service becomes valid', async () => {
      // Mock configure to reject initially, then succeed
      const configureSpy = vi.spyOn(mockService, 'configure')
        .mockRejectedValueOnce(new Error('Cannot configure from state: error'))
        .mockResolvedValueOnce(undefined);
      
      // Set service to invalid state and queue config
      mockService._setState(STATE_ERROR);
      const newConfig = { host: 'new-host', port: 5433 };
      await plugin.updateConfigLabel('database', newConfig);
      
      // Simulate service recovery
      mockService._setState(STATE_RUNNING);
      
      // Trigger state change event
      const stateChangeHandler = manager.on.mock.calls.find(
        call => call[0] === SERVICE_STATE_CHANGED
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

    it('should handle config update errors gracefully', async () => {
      // Make configure throw an error
      vi.spyOn(mockService, 'configure').mockRejectedValue(new Error('Config failed'));
      
      const newConfig = { host: 'new-host', port: 5433 };
      
      const updatedServices = await plugin.updateConfigLabel('database', newConfig);
      
      expect(updatedServices).toEqual([]);
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });

    it('should update plugin config object even if service update fails', async () => {
      vi.spyOn(mockService, 'configure').mockRejectedValue(new Error('Config failed'));
      
      const newConfig = { host: 'new-host', port: 5433 };
      
      await plugin.updateConfigLabel('database', newConfig);
      
      expect(plugin.configObject.database).toEqual(newConfig);
    });

    it('should skip services with non-string config labels', async () => {
      // Register service with object config
      manager.register('direct-config-service', MockService, { direct: 'config' });
      await manager.startService('direct-config-service');
      
      const directService = manager.services.get('direct-config-service').instance;
      directService._setState(STATE_RUNNING);
      
      const newConfig = { host: 'new-host', port: 5433 };
      
      const updatedServices = await plugin.updateConfigLabel('database', newConfig);
      
      expect(updatedServices).toEqual(['test-service']); // Only the database service
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should attach to manager and set up event listener', () => {
      manager.attachPlugin(plugin);
      
      expect(plugin.manager).toBe(manager);
      expect(manager.on).toHaveBeenCalledWith(
        SERVICE_STATE_CHANGED,
        expect.any(Function)
      );
      expect(manager.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('ObjectConfigPlugin attached')
      );
    });

    it('should detach from manager and clear pending updates', () => {
      manager.attachPlugin(plugin);
      
      // Clear previous mock calls
      vi.clearAllMocks();
      
      // Add a pending update
      plugin.updateConfigLabel('test-label', { test: 'config' });
      
      manager.detachPlugin('object-config'); // Use plugin name, not object
      
      expect(manager.logger.info).toHaveBeenCalledWith(
        'ObjectConfigPlugin detached'
      );
      // Note: Can't directly test private field, but it's cleared in _onDetach
    });
  });

  describe('State Validation (via ServiceBase)', () => {
    let mockService;

    beforeEach(async () => {
      manager.attachPlugin(plugin);
      manager.register('test-service', MockService, 'database');
      await manager.startService('test-service');
      mockService = manager.services.get('test-service').instance;
    });

    it('should apply config when ServiceBase allows it', async () => {
      // Mock configure to succeed
      const configureSpy = vi.spyOn(mockService, 'configure').mockResolvedValue();
      
      const updatedServices = await plugin.updateConfigLabel('database', { test: 'config' });
      
      expect(updatedServices).toEqual(['test-service']);
      expect(configureSpy).toHaveBeenCalledWith({ test: 'config' });
    });

    it('should queue config when ServiceBase rejects it', async () => {
      // Mock configure to reject due to invalid state
      const configureSpy = vi.spyOn(mockService, 'configure')
        .mockRejectedValue(new Error('Cannot configure from state: error'));
      
      const updatedServices = await plugin.updateConfigLabel('database', { test: 'config' });
      
      expect(updatedServices).toEqual([]);
      expect(configureSpy).toHaveBeenCalledWith({ test: 'config' });
      expect(manager.logger.debug).toHaveBeenCalledWith(
        expect.stringContaining('will retry when service state allows')
      );
    });
  });
});