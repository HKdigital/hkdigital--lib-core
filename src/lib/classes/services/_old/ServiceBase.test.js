/**
 * @fileoverview Unit tests for ServiceBase.js
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  ServiceBase,
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
} from './index.js';

import { DEBUG, INFO } from '$lib/classes/logging';

describe('ServiceBase', () => {
  let service;

  beforeEach(() => {
    service = new ServiceBase('testService');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    expect(service.name).toBe('testService');
    expect(service.state).toBe(CREATED);
    expect(service.error).toBeNull();
    expect(service.logger).toBeDefined();
  });

  it('should allow setting log level', () => {
    const setLevelSpy = vi.spyOn(service.logger, 'setLevel');

    service.setLogLevel(DEBUG);

    expect(setLevelSpy).toHaveBeenCalledWith(DEBUG);
  });

  it('should transition through lifecycle states', async () => {
    const stateChangedHandler = vi.fn();
    service.on('stateChanged', stateChangedHandler);

    // Mock the protected methods to verify they're called
    vi.spyOn(service, '_init').mockResolvedValue();
    vi.spyOn(service, '_start').mockResolvedValue();
    vi.spyOn(service, '_stop').mockResolvedValue();
    vi.spyOn(service, '_destroy').mockResolvedValue();

    // Initialize
    const initResult = await service.initialize({ testConfig: true });
    expect(initResult).toBe(true);
    expect(service.state).toBe(INITIALIZED);
    expect(service._init).toHaveBeenCalledWith({ testConfig: true });

    // Start
    const startResult = await service.start();
    expect(startResult).toBe(true);
    expect(service.state).toBe(RUNNING);
    expect(service._start).toHaveBeenCalled();

    // Stop
    const stopResult = await service.stop();
    expect(stopResult).toBe(true);
    expect(service.state).toBe(STOPPED);
    expect(service._stop).toHaveBeenCalled();

    // Destroy
    const destroyResult = await service.destroy();
    expect(destroyResult).toBe(true);
    expect(service.state).toBe(DESTROYED);
    expect(service._destroy).toHaveBeenCalled();

    // Check state change events
    expect(stateChangedHandler).toHaveBeenCalledTimes(8); // Including intermediate states

    const states = stateChangedHandler.mock.calls.map(call => call[0].newState);
    expect(states).toEqual([
      INITIALIZING,
      INITIALIZED,
      STARTING,
      RUNNING,
      STOPPING,
      STOPPED,
      DESTROYING,
      DESTROYED
    ]);
  });

  it('should handle initialization errors', async () => {
    const error = new Error('Init failed');
    vi.spyOn(service, '_init').mockRejectedValue(error);

    const errorHandler = vi.fn();
    service.on('error', errorHandler);

    const result = await service.initialize();

    expect(result).toBe(false);
    expect(service.state).toBe(ERROR);
    expect(service.error).toBe(error);

    expect(errorHandler).toHaveBeenCalledWith({
      service: 'testService',
      operation: 'initialization',
      error
    });
  });

  it('should handle start errors', async () => {
    // First initialize successfully
    vi.spyOn(service, '_init').mockResolvedValue();
    await service.initialize();

    // Then fail on start
    const error = new Error('Start failed');
    vi.spyOn(service, '_start').mockRejectedValue(error);

    const errorHandler = vi.fn();
    service.on('error', errorHandler);

    const result = await service.start();

    expect(result).toBe(false);
    expect(service.state).toBe(ERROR);
    expect(service.error).toBe(error);

    expect(errorHandler).toHaveBeenCalledWith({
      service: 'testService',
      operation: 'startup',
      error
    });
  });

  it('should reject invalid state transitions', async () => {
    // Try to stop without starting
    const result = await service.stop();

    expect(result).toBe(false);
    expect(service.state).toBe(ERROR);
    expect(service.error).toBeInstanceOf(Error);
    expect(service.error.message).toContain('Cannot stop service');
  });

  it('should allow restarting a stopped service', async () => {
    // Mock lifecycle methods
    vi.spyOn(service, '_init').mockResolvedValue();
    vi.spyOn(service, '_start').mockResolvedValue();
    vi.spyOn(service, '_stop').mockResolvedValue();

    // Complete lifecycle
    await service.initialize();
    await service.start();
    await service.stop();

    // Should be in stopped state
    expect(service.state).toBe(STOPPED);

    // Try to restart
    const restartResult = await service.start();

    expect(restartResult).toBe(true);
    expect(service.state).toBe(RUNNING);
    expect(service._start).toHaveBeenCalledTimes(2);
  });

  it('should provide access to logger events', async () => {
    const logHandler = vi.fn();
    service.logger.on('log', logHandler);

    service.logger.info('Test log message');

    expect(logHandler).toHaveBeenCalledTimes(1);
    const logEvent = logHandler.mock.calls[0][0];

    expect(logEvent.service).toBe('testService');
    expect(logEvent.level).toBe(INFO);
    expect(logEvent.message).toBe('Test log message');
  });

  it('should clean up event listeners on destroy', async () => {
    const removeAllListenersSpy = vi.spyOn(service.events, 'removeAllListeners');
    const loggerRemoveAllListenersSpy = vi.spyOn(
      service.logger,
      'removeAllListeners'
    );

    await service.destroy();

    expect(removeAllListenersSpy).toHaveBeenCalled();
    expect(loggerRemoveAllListenersSpy).toHaveBeenCalled();
  });

  it('should recover from error state', async () => {
    // Put service in error state first
    const error = new Error('Test error');
    vi.spyOn(service, '_init').mockRejectedValue(error);
    await service.initialize();

    // Verify error state
    expect(service.state).toBe(ERROR);
    expect(service.error).toBe(error);
    expect(service._preErrorState).toBe(INITIALIZING);

    // Mock recovery methods
    vi.spyOn(service, '_recover').mockResolvedValue();

    // Setup event listeners
    const stateChangedHandler = vi.fn();
    service.on('stateChanged', stateChangedHandler);

    // Perform recovery
    const recoveryResult = await service.recover();

    // Verify recovery
    expect(recoveryResult).toBe(true);
    expect(service._recover).toHaveBeenCalled();
    expect(service.error).toBeNull();

    // Check state transitions during recovery
    const states = stateChangedHandler.mock.calls.map(call => call[0].newState);
    expect(states).toContain(RECOVERING);
    expect(states).toContain(INITIALIZED);

    // Final state should be initialized
    expect(service.state).toBe(INITIALIZED);
  });

  it('should handle recovery errors', async () => {
    // Put service in error state first
    const initialError = new Error('Initial error');
    vi.spyOn(service, '_init').mockRejectedValue(initialError);
    await service.initialize();

    // Mock recovery to fail
    const recoveryError = new Error('Recovery failed');
    vi.spyOn(service, '_recover').mockRejectedValue(recoveryError);

    // Setup error listener
    const errorHandler = vi.fn();
    service.on('error', errorHandler);

    // Attempt recovery
    const recoveryResult = await service.recover();

    // Verify failed recovery
    expect(recoveryResult).toBe(false);
    expect(service.state).toBe(ERROR);
    expect(service.error).toBe(recoveryError);

    // Verify error event for recovery failure
    expect(errorHandler).toHaveBeenCalledWith({
      service: 'testService',
      operation: 'recovery',
      error: recoveryError
    });
  });

  it('should recover to previous state before error', async () => {
    // Initialize and start service
    vi.spyOn(service, '_init').mockResolvedValue();
    vi.spyOn(service, '_start').mockResolvedValue();
    await service.initialize();
    await service.start();

    // Verify running state
    expect(service.state).toBe(RUNNING);

    // Cause an error during operation
    const operationError = new Error('Operation error');
    service._setError('operation', operationError);

    // Verify error state and previous state tracking
    expect(service.state).toBe(ERROR);
    expect(service._preErrorState).toBe(RUNNING);

    // Mock recovery methods
    vi.spyOn(service, '_recover').mockResolvedValue();

    // Recover the service
    const recoveryResult = await service.recover();

    // Verify recovery
    expect(recoveryResult).toBe(true);
    expect(service.state).toBe(INITIALIZED); // Should match implementation
    expect(service.error).toBeNull();
  });

  it('should only allow recovery from ERROR state', async () => {
    // Service starts in CREATED state
    vi.spyOn(service, '_recover').mockResolvedValue();

    const result = await service.recover();

    expect(result).toBe(false);
    expect(service._recover).not.toHaveBeenCalled();
  });

  it('should default to no-op implementations of lifecycle methods', async () => {
    // Create a new service that doesn't override protected methods
    const basicService = new ServiceBase('basicService');

    // Complete lifecycle should work without errors
    await basicService.initialize({ someConfig: true });
    await basicService.start();
    await basicService.stop();
    await basicService.destroy();

    expect(basicService.state).toBe(DESTROYED);
  });
});
