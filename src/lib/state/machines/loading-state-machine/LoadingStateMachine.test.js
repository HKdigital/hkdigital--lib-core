import { describe, it, expect } from 'vitest';

import { LoadingStateMachine } from '$lib/state/machines.js';

import {
  STATE_INITIAL,
  STATE_LOADED,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_ABORTING,
  STATE_ABORTED,
  STATE_ERROR,
  STATE_TIMEOUT,
  LOAD,
  LOADED,
  ABORT,
  ABORTED,
  ERROR,
  UNLOAD,
  INITIAL,
  TIMEOUT
} from './constants.js';

describe('LoadingStateMachine', () => {
  it('should transition to stated loaded', () => {
    let state = new LoadingStateMachine();

    expect(state.current).toEqual(STATE_INITIAL);

    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(LOADED);
    expect(state.current).toEqual(STATE_LOADED);

    state.send(UNLOAD);
    expect(state.current).toEqual(STATE_UNLOADING);

    state.send(INITIAL);
    expect(state.current).toEqual(STATE_INITIAL);
  });
});

describe('LoadingStateMachine', () => {
  it('should transition to aborted states', async () => {
    let state = new LoadingStateMachine();

    expect(state.current).toEqual(STATE_INITIAL);

    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(ABORT);
    expect(state.current).toEqual(STATE_ABORTING);

    state.send(ABORTED);
    expect(state.current).toEqual(STATE_ABORTED);

    // Go back to loading
    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(ABORT);
    expect(state.current).toEqual(STATE_ABORTING);

    // Test error during abort
    state.send(ERROR, new Error('Abort failed'));
    expect(state.current).toEqual(STATE_ERROR);

    // Go back to state unloading

    state.send(UNLOAD);
    expect(state.current).toEqual(STATE_UNLOADING);

    state.send(INITIAL);
    expect(state.current).toEqual(STATE_INITIAL);
  });
});

describe('LoadingStateMachine', () => {
  it('should transition to stated error', () => {
    let state = new LoadingStateMachine();

    expect(state.current).toEqual(STATE_INITIAL);

    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(ERROR);
    expect(state.current).toEqual(STATE_ERROR);

    // Go back to loading
    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(ABORT);
    expect(state.current).toEqual(STATE_ABORTING);

    state.send(ABORTED);
    expect(state.current).toEqual(STATE_ABORTED);

    // Go back to state unloading

    state.send(UNLOAD);
    expect(state.current).toEqual(STATE_UNLOADING);

    state.send(INITIAL);
    expect(state.current).toEqual(STATE_INITIAL);
  });
});

describe('LoadingStateMachine - onenter callback', () => {
  it('should call onenter callback for all state transitions except initial', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (currentState) => {
      callbackCalls.push(currentState);
    };

    expect(machine.current).toBe(STATE_INITIAL);
    expect(callbackCalls).toEqual([]); // No callback for initial construction

    machine.send(LOAD);
    expect(callbackCalls).toEqual([STATE_LOADING]);

    machine.send(LOADED);
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_LOADED]);

    machine.send(UNLOAD);
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_LOADED, STATE_UNLOADING]);

    machine.send(INITIAL);
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_LOADED, STATE_UNLOADING, STATE_INITIAL]);
  });

  it('should call onenter callback for abort states', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (currentState) => {
      callbackCalls.push(currentState);
    };

    machine.send(LOAD);
    machine.send(ABORT);
    machine.send(ABORTED);
    
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_ABORTING, STATE_ABORTED]);
  });

  it('should call onenter callback for error state', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (currentState) => {
      callbackCalls.push(currentState);
    };

    machine.send(LOAD);
    machine.send(ERROR, new Error('Test error'));
    
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_ERROR]);
  });

  it('should work without onenter callback set', () => {
    const machine = new LoadingStateMachine();
    
    // Should not throw errors when onenter is null
    expect(() => {
      machine.send(LOAD);
      machine.send(ABORT);
      machine.send(ABORTED);
    }).not.toThrow();
    
    expect(machine.current).toBe(STATE_ABORTED);
  });

  it('should handle onenter callback changes during execution', () => {
    let firstCalls = [];
    let secondCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (currentState) => {
      firstCalls.push(currentState);
    };

    machine.send(LOAD);
    expect(firstCalls).toEqual([STATE_LOADING]);

    // Change callback
    machine.onenter = (currentState) => {
      secondCalls.push(currentState);
    };

    machine.send(LOADED);
    expect(firstCalls).toEqual([STATE_LOADING]); // No more calls to first callback
    expect(secondCalls).toEqual([STATE_LOADED]); // New callback receives calls
  });
});

describe('LoadingStateMachine - timeout functionality', () => {
  it('should transition from loading to timeout state', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);

    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_TIMEOUT);
  });

  it('should transition from timeout to loading state', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_TIMEOUT);

    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);
  });

  it('should transition from timeout to unloading state', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_TIMEOUT);

    machine.send(UNLOAD);
    expect(machine.current).toBe(STATE_UNLOADING);
  });

  it('should call timeout method to trigger timeout', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);

    machine.timeout();
    expect(machine.current).toBe(STATE_TIMEOUT);
  });

  it('should call abort method to trigger abort', () => {
    const machine = new LoadingStateMachine();
    
    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);
    
    machine.abort();
    expect(machine.current).toBe(STATE_ABORTING);
  });

  it('should require manual transition from aborting to aborted', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    machine.send(ABORT);
    expect(machine.current).toBe(STATE_ABORTING);

    // Should stay in aborting until explicitly moved to aborted
    expect(machine.current).toBe(STATE_ABORTING);

    machine.send(ABORTED);
    expect(machine.current).toBe(STATE_ABORTED);
  });

  it('should allow error transition from aborting state', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    machine.send(ABORT);
    expect(machine.current).toBe(STATE_ABORTING);

    // Error during abort process
    machine.send(ERROR, new Error('Abort operation failed'));
    expect(machine.current).toBe(STATE_ERROR);
    expect(machine.error.message).toBe('Abort operation failed');
  });

  it('should call onenter callback for timeout state', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();

    machine.onenter = (currentState) => {
      callbackCalls.push(currentState);
    };

    machine.send(LOAD);
    machine.send(TIMEOUT);

    expect(callbackCalls).toEqual([STATE_LOADING, STATE_TIMEOUT]);
  });

  it('should only allow timeout from loading state', () => {
    const machine = new LoadingStateMachine();

    // Try timeout from initial state (should remain in initial)
    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_INITIAL);

    // Try timeout from loaded state (should remain in loaded)
    machine.send(LOAD);
    machine.send(LOADED);
    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_LOADED);

    // Try timeout from loading state (should succeed)
    machine.send(LOAD);
    machine.send(TIMEOUT);
    expect(machine.current).toBe(STATE_TIMEOUT);
  });
});
