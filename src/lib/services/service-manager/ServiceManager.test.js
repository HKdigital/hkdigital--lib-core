/**
 * @fileoverview Unit tests for ServiceManager.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceManager } from './ServiceManager.js';
import { DEBUG, INFO } from '$lib/logging/index.js';
import { ServiceBase } from '$lib/services/service-base/ServiceBase.js';
import {
  STATE_NOT_CREATED,
  STATE_CONFIGURED,
  STATE_RUNNING,
  STATE_STOPPED,
  STATE_ERROR
} from '$lib/services/service-base/constants.js';

// Mock service classes
class MockServiceA extends ServiceBase {
  async _configure(config) {
    this.config = config;
  }
  async _start() {
    this.started = true;
  }
  async _stop() {
    this.started = false;
  }
}

class MockServiceB extends ServiceBase {
  async _configure(config) {
    this.config = config;
  }
  async _start() {
    this.started = true;
  }
  async _stop() {
    this.started = false;
  }
}

class MockServiceC extends ServiceBase {
  async _configure(config) {
    this.config = config;
  }
  async _start() {
    this.started = true;
  }
  async _stop() {
    this.started = false;
  }
  async _healthCheck() {
    return { custom: 'health-data' };
  }
}

describe('ServiceManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ServiceManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Registration', () => {
    it('should register service classes', () => {
      manager.register('serviceA', MockServiceA, { configA: true });
      manager.register('serviceB', MockServiceB, { configB: true });

      expect(manager.services.size).toBe(2);
      expect(manager.services.has('serviceA')).toBe(true);
      expect(manager.services.has('serviceB')).toBe(true);
    });

    it('should reject duplicate registrations', () => {
      manager.register('serviceA', MockServiceA);

      expect(() => {
        manager.register('serviceA', MockServiceB);
      }).toThrow("Service 'serviceA' already registered");
    });

    it('should register with options', () => {
      manager.register(
        'serviceA',
        MockServiceA,
        { test: true },
        {
          dependencies: ['database'],
          tags: ['critical', 'api'],
          startupPriority: 10
        }
      );

      const entry = manager.services.get('serviceA');
      expect(entry.dependencies).toEqual(['database']);
      expect(entry.tags).toEqual(['critical', 'api']);
      expect(entry.startupPriority).toBe(10);
    });

    it('should track dependents', () => {
      manager.register('serviceA', MockServiceA);
      manager.register(
        'serviceB',
        MockServiceB,
        {},
        {
          dependencies: ['serviceA']
        }
      );

      const entryA = manager.services.get('serviceA');
      expect(entryA.dependents.has('serviceB')).toBe(true);
    });
  });

  describe('Lazy Instantiation', () => {
    it('should create instances on first get', () => {
      manager.register('serviceA', MockServiceA);

      const entry = manager.services.get('serviceA');
      expect(entry.instance).toBeNull();

      const instance = manager.get('serviceA');
      expect(instance).toBeInstanceOf(MockServiceA);
      expect(entry.instance).toBe(instance);
    });

    it('should reuse existing instances', () => {
      manager.register('serviceA', MockServiceA);

      const instance1 = manager.get('serviceA');
      const instance2 = manager.get('serviceA');

      expect(instance1).toBe(instance2);
    });

    it('should return null for unregistered services', () => {
      const instance = manager.get('unknown');
      expect(instance).toBeNull();
    });

    it('should handle constructor errors', () => {
      class FailingService extends ServiceBase {
        constructor() {
          throw new Error('Constructor failed');
        }
      }

      manager.register('failing', FailingService);
      const instance = manager.get('failing');

      expect(instance).toBeNull();
    });
  });

  describe('Service Lifecycle', () => {
    beforeEach(() => {
      manager.register('serviceA', MockServiceA, { configA: true });
      manager.register('serviceB', MockServiceB, { configB: true });
    });

    it('should configure services', async () => {
      const result = await manager.configureService('serviceA');
      const instance = manager.get('serviceA');

      expect(result).toBe(true);
      expect(instance.state).toBe(STATE_CONFIGURED);
      expect(instance.config).toEqual({ configA: true });
    });

    it('should start services', async () => {
      const result = await manager.startService('serviceA');
      const instance = manager.get('serviceA');

      expect(result).toBe(true);
      expect(instance.state).toBe(STATE_RUNNING);
      expect(instance.started).toBe(true);
    });

    it('should stop services', async () => {
      await manager.startService('serviceA');
      const result = await manager.stopService('serviceA');
      const instance = manager.get('serviceA');

      expect(result).toBe(true);
      expect(instance.state).toBe(STATE_STOPPED);
      expect(instance.started).toBe(false);
    });

    it('should recover services', async () => {
      const instance = manager.get('serviceA');
      await instance.configure();
      await instance.start();

      // Force error state
      instance.state = STATE_ERROR;
      instance.error = new Error('Test error');

      const result = await manager.recoverService('serviceA');

      expect(result).toBe(true);
      expect(instance.state).toBe(STATE_RUNNING);
      expect(instance.error).toBeNull();
    });
  });

  describe('Dependencies', () => {
    beforeEach(() => {
      manager.register('database', MockServiceA);
      manager.register(
        'cache',
        MockServiceB,
        {},
        {
          dependencies: ['database']
        }
      );
      manager.register(
        'api',
        MockServiceC,
        {},
        {
          dependencies: ['database', 'cache']
        }
      );
    });

    it('should start dependencies first', async () => {
      const startOrder = [];

      // Track start order
      vi.spyOn(MockServiceA.prototype, '_start').mockImplementation(
        async function () {
          startOrder.push('database');
          this.started = true;
        }
      );
      vi.spyOn(MockServiceB.prototype, '_start').mockImplementation(
        async function () {
          startOrder.push('cache');
          this.started = true;
        }
      );
      vi.spyOn(MockServiceC.prototype, '_start').mockImplementation(
        async function () {
          startOrder.push('api');
          this.started = true;
        }
      );

      await manager.startService('api');

      expect(startOrder).toEqual(['database', 'cache', 'api']);
    });

    it('should fail if dependency fails to start', async () => {
      vi.spyOn(MockServiceA.prototype, '_start').mockRejectedValue(
        new Error('Database failed')
      );

      const result = await manager.startService('cache');

      expect(result).toBe(false);
      const cache = manager.get('cache');
      expect(cache.state).not.toBe(STATE_RUNNING);
    });

    it('should prevent stopping services with running dependents', async () => {
      await manager.startAll();

      const result = await manager.stopService('database');

      expect(result).toBe(false);
      const database = manager.get('database');
      expect(database.state).toBe(STATE_RUNNING);
    });

    it('should allow force stopping', async () => {
      await manager.startAll();

      const result = await manager.stopService('database', { force: true });

      expect(result).toBe(true);
      const database = manager.get('database');
      expect(database.state).toBe(STATE_STOPPED);
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      manager.register('serviceA', MockServiceA);
      manager.register(
        'serviceB',
        MockServiceB,
        {},
        {
          dependencies: ['serviceA']
        }
      );
      manager.register(
        'serviceC',
        MockServiceC,
        {},
        {
          dependencies: ['serviceB']
        }
      );
    });

    it('should start all services in order', async () => {
      const results = await manager.startAll();

      expect(results).toEqual({
        serviceA: true,
        serviceB: true,
        serviceC: true
      });

      expect(manager.get('serviceA').state).toBe(STATE_RUNNING);
      expect(manager.get('serviceB').state).toBe(STATE_RUNNING);
      expect(manager.get('serviceC').state).toBe(STATE_RUNNING);
    });

    it('should stop all services in reverse order', async () => {
      await manager.startAll();

      const stopOrder = [];
      vi.spyOn(MockServiceA.prototype, '_stop').mockImplementation(
        async function () {
          stopOrder.push('serviceA');
          this.started = false;
        }
      );
      vi.spyOn(MockServiceB.prototype, '_stop').mockImplementation(
        async function () {
          stopOrder.push('serviceB');
          this.started = false;
        }
      );
      vi.spyOn(MockServiceC.prototype, '_stop').mockImplementation(
        async function () {
          stopOrder.push('serviceC');
          this.started = false;
        }
      );

      await manager.stopAll();

      expect(stopOrder).toEqual(['serviceC', 'serviceB', 'serviceA']);
    });

    it('should handle timeout during stopAll', async () => {
      vi.useFakeTimers();

      await manager.startAll();

      // Make serviceB hang during stop
      vi.spyOn(MockServiceB.prototype, '_stop').mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const stopPromise = manager.stopAll({ timeout: 1000 });
      await vi.advanceTimersByTimeAsync(1100);

      const results = await stopPromise;

      // Should timeout but still return results
      expect(results.serviceB).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(() => {
      manager.register('serviceA', MockServiceA);
      manager.register('serviceC', MockServiceC); // Has custom health check
    });

    it('should check health of all services', async () => {
      await manager.startService('serviceA');
      await manager.startService('serviceC');

      const health = await manager.checkHealth();

      expect(health.serviceA).toMatchObject({
        name: 'serviceA',
        state: STATE_RUNNING,
        healthy: true
      });

      expect(health.serviceC).toMatchObject({
        name: 'serviceC',
        state: STATE_RUNNING,
        healthy: true,
        custom: 'health-data'
      });
    });

    it('should report health for non-created services', async () => {
      const health = await manager.checkHealth();

      expect(health.serviceA).toEqual({
        name: 'serviceA',
        state: STATE_NOT_CREATED,
        healthy: false
      });
    });
  });

  describe('Event Forwarding', () => {
    it('should forward service state changes', async () => {
      manager.register('serviceA', MockServiceA);

      const stateEvents = [];
      manager.on('service:stateChanged', (e) => stateEvents.push(e));

      await manager.startService('serviceA');

      expect(stateEvents.length).toBeGreaterThan(0);
      expect(stateEvents[0]).toMatchObject({
        service: 'serviceA',
        data: {
          oldState: expect.any(String),
          newState: expect.any(String)
        }
      });
    });

    it('should forward health changes', async () => {
      manager.register('serviceA', MockServiceA);

      const healthEvents = [];
      manager.on('service:healthChanged', (e) => healthEvents.push(e));

      await manager.startService('serviceA');

      expect(healthEvents).toHaveLength(1);
      expect(healthEvents[0]).toEqual({
        service: 'serviceA',
        data: {
          healthy: true,
          wasHealthy: false
        }
      });
    });

    it('should forward errors', async () => {
      manager.register('serviceA', MockServiceA);

      const errorEvents = [];
      manager.on('service:error', (e) => errorEvents.push(e));

      const instance = manager.get('serviceA');
      vi.spyOn(instance, '_configure').mockRejectedValue(
        new Error('Configure failed')
      );

      await manager.configureService('serviceA');

      expect(errorEvents).toHaveLength(1);
      expect(errorEvents[0]).toMatchObject({
        service: 'serviceA',
        data: {
          operation: 'configuration',
          error: expect.objectContaining({
            message: 'configuration failed',
            cause: expect.objectContaining({ message: 'Configure failed' })
          })
        }
      });
    });

    it('should forward log events', () => {
      manager.register('serviceA', MockServiceA);

      const logEvents = [];
      manager.on('service:log', (e) => logEvents.push(e));

      const instance = manager.get('serviceA');
      instance.logger.info('Test log');

      expect(logEvents).toHaveLength(1);
      expect(logEvents[0]).toMatchObject({
        source: 'serviceA',
        level: INFO,
        message: 'Test log'
      });
    });
  });

  describe('Logging Configuration', () => {
    it('should set default log level based on debug flag', () => {
      const devManager = new ServiceManager({ debug: true });
      expect(devManager.config.defaultLogLevel).toBe(DEBUG);

      const prodManager = new ServiceManager({ debug: false });
      expect(prodManager.config.defaultLogLevel).toBe(INFO);
    });

    it('should set manager log level', () => {
      manager.setManagerLogLevel(DEBUG);

      expect(manager.config.managerLogLevel).toBe(DEBUG);
    });

    it('should set service-specific log level', () => {
      manager.register('serviceA', MockServiceA);
      const instance = manager.get('serviceA');

      vi.spyOn(instance, 'setLogLevel');

      manager.setServiceLogLevel('serviceA', DEBUG);

      expect(instance.setLogLevel).toHaveBeenCalledWith(DEBUG);
      expect(manager.config.serviceLogLevels.serviceA).toBe(DEBUG);
    });
  });

  describe('Service Tags', () => {
    beforeEach(() => {
      manager.register(
        'database',
        MockServiceA,
        {},
        { tags: ['storage', 'critical'] }
      );
      manager.register(
        'cache',
        MockServiceB,
        {},
        { tags: ['storage', 'performance'] }
      );
      manager.register('api', MockServiceC, {}, { tags: ['api', 'critical'] });
    });

    it('should get services by tag', () => {
      expect(manager.getServicesByTag('storage')).toEqual([
        'database',
        'cache'
      ]);
      expect(manager.getServicesByTag('critical')).toEqual(['database', 'api']);
      expect(manager.getServicesByTag('performance')).toEqual(['cache']);
      expect(manager.getServicesByTag('unknown')).toEqual([]);
    });
  });

  describe('Circular Dependencies', () => {
    it('should detect circular dependencies', async () => {
      manager.register(
        'serviceA',
        MockServiceA,
        {},
        {
          dependencies: ['serviceB']
        }
      );
      manager.register(
        'serviceB',
        MockServiceB,
        {},
        {
          dependencies: ['serviceC']
        }
      );
      manager.register(
        'serviceC',
        MockServiceC,
        {},
        {
          dependencies: ['serviceA'] // Creates cycle
        }
      );

      await expect(manager.startAll()).rejects.toThrow(
        'Circular dependency detected'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle missing service in operations', async () => {
      expect(await manager.configureService('unknown')).toBe(false);
      expect(await manager.startService('unknown')).toBe(false);
      expect(await manager.stopService('unknown')).toBe(true); // Already stopped
      expect(await manager.recoverService('unknown')).toBe(false);
    });

    it('should continue on partial startup failure', async () => {
      manager.register('serviceA', MockServiceA);
      manager.register('serviceB', MockServiceB);

      vi.spyOn(MockServiceA.prototype, '_start').mockRejectedValue(
        new Error('Start failed')
      );

      const results = await manager.startAll();

      expect(results).toEqual({
        serviceA: false,
        serviceB: false // Stops on first failure
      });
    });
  });

  describe('onServiceLogEvent', () => {
    it('should listen to service log events', () => {
      const listener = vi.fn();
      const unsubscribe = manager.onServiceLogEvent(listener);

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('setServiceLogLevel', () => {
    it('should set single service log level', () => {
      manager.register('auth', MockServiceA);
      manager.setServiceLogLevel('auth', 'debug');

      expect(manager.config.serviceLogLevels.auth).toBe('debug');
    });

    it('should set manager log level', () => {
      manager.setManagerLogLevel('warn');

      expect(manager.config.managerLogLevel).toBe('warn');
    });

    it('should parse string configuration', () => {
      manager.register('auth', MockServiceA);
      manager.register('database', MockServiceB);

      manager.setServiceLogLevel('auth:debug,database:info');

      expect(manager.config.serviceLogLevels.auth).toBe('debug');
      expect(manager.config.serviceLogLevels.database).toBe('info');
    });

    it('should accept object configuration', () => {
      manager.register('auth', MockServiceA);
      manager.register('cache', MockServiceB);

      manager.setServiceLogLevel({ auth: 'warn', cache: 'error' });

      expect(manager.config.serviceLogLevels.auth).toBe('warn');
      expect(manager.config.serviceLogLevels.cache).toBe('error');
    });
  });
});
