/**
 * @fileoverview Unit tests for ServiceManager.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ServiceBase, ServiceManager } from './index.js';

import {
  CREATED,
  INITIALIZING,
  INITIALIZED,
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
  DESTROYING,
  DESTROYED,
  ERROR,
  RECOVERING
} from './constants.js';

// Mock service implementation
class MockService extends ServiceBase {
  constructor(name) {
    super(name);
    
    // Add mocks for lifecycle methods
    this._init = vi.fn().mockResolvedValue(undefined);
    this._start = vi.fn().mockResolvedValue(undefined);
    this._stop = vi.fn().mockResolvedValue(undefined);
    this._destroy = vi.fn().mockResolvedValue(undefined);
    this._recover = vi.fn().mockResolvedValue(undefined);
  }
}

describe('ServiceManager', () => {
  let manager;
  let serviceA;
  let serviceB;
  let serviceC;

  beforeEach(() => {
    // Setup clean manager and services
    manager = new ServiceManager();
    serviceA = new MockService('serviceA');
    serviceB = new MockService('serviceB');
    serviceC = new MockService('serviceC');
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register services', () => {
    expect(manager.register('serviceA', serviceA)).toBe(true);
    expect(manager.register('serviceB', serviceB)).toBe(true);
    
    expect(manager.getServiceNames()).toEqual(['serviceA', 'serviceB']);
    expect(manager.getService('serviceA')).toBe(serviceA);
  });

  it('should handle service dependencies', () => {
    // Register services with dependencies
    manager.register('serviceA', serviceA);
    
    // B depends on A
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    
    // C depends on B
    const result = manager.register('serviceC', serviceC, {
      dependencies: ['serviceB']
    });
    
    expect(result).toBe(true);
    
    // Check dependency tracking
    const statusB = manager.getServiceStatus('serviceB');
    const statusC = manager.getServiceStatus('serviceC');
    
    expect(statusB.dependencies).toEqual(['serviceA']);
    expect(statusC.dependencies).toEqual(['serviceB']);
  });
  
  it('should reject registration with missing dependencies', () => {
    // Try to register with a non-existent dependency
    const result = manager.register('serviceB', serviceB, {
      dependencies: ['nonExistentService']
    });
    
    expect(result).toBe(false);
    expect(manager.getService('serviceB')).toBeNull();
  });

  it('should initialize services', async () => {
    manager.register('serviceA', serviceA);
    
    const config = { testOption: 'value' };
    const result = await manager.initializeService('serviceA', config);
    
    expect(result).toBe(true);
    expect(serviceA._init).toHaveBeenCalledWith(config);
    expect(serviceA.state).toBe(INITIALIZED);
  });

  it('should initialize all services', async () => {
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB);
    
    const configs = {
      serviceA: { optionA: 'valueA' },
      serviceB: { optionB: 'valueB' }
    };
    
    const result = await manager.initializeAll(configs);
    
    expect(result).toBe(true);
    expect(serviceA._init).toHaveBeenCalledWith(configs.serviceA);
    expect(serviceB._init).toHaveBeenCalledWith(configs.serviceB);
    expect(serviceA.state).toBe(INITIALIZED);
    expect(serviceB.state).toBe(INITIALIZED);
  });

  it('should start services respecting dependencies', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    
    await manager.initializeAll();
    
    // Start serviceB (should start A first)
    const result = await manager.startService('serviceB');
    
    expect(result).toBe(true);
    expect(serviceA._start).toHaveBeenCalled();
    expect(serviceB._start).toHaveBeenCalled();
    expect(serviceA.state).toBe(RUNNING);
    expect(serviceB.state).toBe(RUNNING);
  });

  it('should prevent starting if dependencies fail', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    
    await manager.initializeAll();
    
    // Make serviceA fail to start
    serviceA._start.mockRejectedValueOnce(new Error('Failed to start'));
    
    // Try to start serviceB
    const result = await manager.startService('serviceB');
    
    expect(result).toBe(false);
    expect(serviceA._start).toHaveBeenCalled();
    expect(serviceB._start).not.toHaveBeenCalled();
    expect(serviceA.state).toBe(ERROR);
    expect(serviceB.state).toBe(INITIALIZED);
  });

  it('should start all services in dependency order', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    manager.register('serviceC', serviceC, {
      dependencies: ['serviceB']
    });
    
    await manager.initializeAll();
    
    // Start all services
    const result = await manager.startAll();
    
    expect(result).toBe(true);
    
    // Check correct order through invocation order
    const startOrder = [
      serviceA._start.mock.invocationCallOrder[0],
      serviceB._start.mock.invocationCallOrder[0],
      serviceC._start.mock.invocationCallOrder[0]
    ];
    
    // Verify order is ascending (dependencies started first)
    expect(startOrder[0]).toBeLessThan(startOrder[1]);
    expect(startOrder[1]).toBeLessThan(startOrder[2]);
    
    // All services should be running
    expect(serviceA.state).toBe(RUNNING);
    expect(serviceB.state).toBe(RUNNING);
    expect(serviceC.state).toBe(RUNNING);
  });

  it('should stop services considering dependents', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    
    await manager.initializeAll();
    await manager.startAll();
    
    // Try to stop serviceA (should fail because B depends on it)
    const result = await manager.stopService('serviceA');
    
    expect(result).toBe(false);
    expect(serviceA._stop).not.toHaveBeenCalled();
    expect(serviceA.state).toBe(RUNNING);
    
    // Force stop serviceA
    const forceResult = await manager.stopService('serviceA', { force: true });
    
    expect(forceResult).toBe(true);
    expect(serviceB._stop).toHaveBeenCalled(); // B stopped first
    expect(serviceA._stop).toHaveBeenCalled();
    expect(serviceB.state).toBe(STOPPED);
    expect(serviceA.state).toBe(STOPPED);
  });

  it('should stop all services in reverse dependency order', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    manager.register('serviceC', serviceC, {
      dependencies: ['serviceB']
    });
    
    await manager.initializeAll();
    await manager.startAll();
    
    // Stop all services
    const result = await manager.stopAll();
    
    expect(result).toBe(true);
    
    // Check correct order through invocation order
    const stopOrder = [
      serviceC._stop.mock.invocationCallOrder[0],
      serviceB._stop.mock.invocationCallOrder[0],
      serviceA._stop.mock.invocationCallOrder[0]
    ];
    
    // Verify order is ascending (dependents stopped first)
    expect(stopOrder[0]).toBeLessThan(stopOrder[1]);
    expect(stopOrder[1]).toBeLessThan(stopOrder[2]);
    
    // All services should be stopped
    expect(serviceA.state).toBe(STOPPED);
    expect(serviceB.state).toBe(STOPPED);
    expect(serviceC.state).toBe(STOPPED);
  });

  it('should recover services from error state', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    
    await manager.initializeAll();
    
    // Put serviceA in error state
    const error = new Error('Test error');
    serviceA._setError('test', error);
    
    expect(serviceA.state).toBe(ERROR);
    
    // Recover serviceA
    const result = await manager.recoverService('serviceA');
    
    expect(result).toBe(true);
    expect(serviceA._recover).toHaveBeenCalled();
    expect(serviceA._start).toHaveBeenCalled(); // Should call start since autoStart=true

    // Should be running after recovery (with auto-start)
    expect(serviceA.state).toBe(RUNNING);
    expect(serviceA.error).toBeNull();
  });

  it('should recover dependent services', async () => {
    // Setup services with dependencies
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });

    await manager.initializeAll();

    // Put both services in error state
    serviceA._setError('test', new Error('Error A'));
    serviceB._setError('test', new Error('Error B'));

    expect(serviceA.state).toBe(ERROR);
    expect(serviceB.state).toBe(ERROR);

    // Recover serviceB (should recover A first since B depends on A)
    const result = await manager.recoverService('serviceB');

    expect(result).toBe(true);
    expect(serviceA._recover).toHaveBeenCalled();
    expect(serviceB._recover).toHaveBeenCalled();
    expect(serviceA._start).toHaveBeenCalled(); // A should start
    expect(serviceB._start).toHaveBeenCalled(); // B should start

    // Both should be recovered and running
    expect(serviceA.state).toBe(RUNNING);
    expect(serviceB.state).toBe(RUNNING);
  });

  it('should emit events for service state changes', async () => {
    const eventHandler = vi.fn();
    manager.on('service:stateChanged', eventHandler);
    
    manager.register('serviceA', serviceA);
    await manager.initializeService('serviceA');
    
    // Should have received events for state transitions
    expect(eventHandler).toHaveBeenCalledTimes(2); // CREATED->INITIALIZING->INITIALIZED
    
    // Check event data
    const lastEvent = eventHandler.mock.calls[1][0];
    expect(lastEvent.service).toBe('serviceA');
    expect(lastEvent.newState).toBe(INITIALIZED);
  });

  it('should handle circular dependency detection', () => {
    const loggerErrorSpy = vi.spyOn(manager.logger, 'error');
    
    // Create a circular dependency
    manager.register('serviceA', serviceA);
    manager.register('serviceB', serviceB, {
      dependencies: ['serviceA']
    });
    manager.register('serviceC', serviceC, {
      dependencies: ['serviceB']
    });
    
    // Create circular dependency by making A depend on C
    const entry = manager.services.get('serviceA');
    entry.dependencies = ['serviceC'];
    manager._updateDependencyGraph();
    
    // Should detect circular dependency
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Circular dependency detected')
    );
  });
  
  it('should destroy and unregister services', async () => {
    manager.register('serviceA', serviceA);
    await manager.initializeService('serviceA');
    
    const result = await manager.destroyService('serviceA');
    
    expect(result).toBe(true);
    expect(serviceA._destroy).toHaveBeenCalled();
    expect(manager.getService('serviceA')).toBeNull();
  });
  
  it('should allow setting log levels', () => {
    manager.register('serviceA', serviceA);
    
    // Mock the setLogLevel methods
    const managerSetLevelSpy = vi.spyOn(manager.logger, 'setLevel').mockReturnValue(true);
    const serviceSetLevelSpy = vi.spyOn(serviceA, 'setLogLevel').mockReturnValue(true);
    
    // Set log level for specific service
    manager.setLogLevel('debug', 'serviceA');
    expect(serviceSetLevelSpy).toHaveBeenCalledWith('debug');
    
    // Set log level for all services
    manager.setLogLevel('info');
    expect(managerSetLevelSpy).toHaveBeenCalledWith('info');
    expect(serviceSetLevelSpy).toHaveBeenCalledWith('info');
  });
});
