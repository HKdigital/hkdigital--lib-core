import { describe, it, expect } from 'vitest';

import { LoadingStateMachine } from '$lib/state/machines.js';

import {
  STATE_INITIAL,
  STATE_LOADED,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_CANCELLED,
  STATE_ERROR,
  STATE_TIMEOUT,
  LOAD,
  LOADED,
  CANCEL,
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
  it('should transition to stated cancelled', async () => {
    let state = new LoadingStateMachine();

    expect(state.current).toEqual(STATE_INITIAL);

    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(CANCEL);
    expect(state.current).toEqual(STATE_CANCELLED);

    // Go back to loading
    state.send(LOAD);
    expect(state.current).toEqual(STATE_LOADING);

    state.send(CANCEL);
    expect(state.current).toEqual(STATE_CANCELLED);

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

    state.send(CANCEL);
    expect(state.current).toEqual(STATE_CANCELLED);

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

  it('should call onenter callback for cancelled state', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (currentState) => {
      callbackCalls.push(currentState);
    };

    machine.send(LOAD);
    machine.send(CANCEL);
    
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_CANCELLED]);
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
      machine.send(CANCEL);
    }).not.toThrow();
    
    expect(machine.current).toBe(STATE_CANCELLED);
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

  it('should call doTimeout method to trigger timeout', () => {
    const machine = new LoadingStateMachine();

    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);

    machine.doTimeout();
    expect(machine.current).toBe(STATE_TIMEOUT);
  });

  it('should call doCancel method to trigger cancellation', () => {
    const machine = new LoadingStateMachine();
    
    machine.send(LOAD);
    expect(machine.current).toBe(STATE_LOADING);
    
    machine.doCancel();
    expect(machine.current).toBe(STATE_CANCELLED);
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
