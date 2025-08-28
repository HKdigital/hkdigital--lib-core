import { describe, it, expect } from 'vitest';

import { LoadingStateMachine } from '$lib/state/machines.js';

import {
  STATE_INITIAL,
  STATE_LOADED,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_CANCELLED,
  STATE_ERROR,
  LOAD,
  LOADED,
  CANCEL,
  ERROR,
  UNLOAD,
  INITIAL
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
    
    machine.onenter = (state) => {
      callbackCalls.push(state);
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
    
    machine.onenter = (state) => {
      callbackCalls.push(state);
    };

    machine.send(LOAD);
    machine.send(CANCEL);
    
    expect(callbackCalls).toEqual([STATE_LOADING, STATE_CANCELLED]);
  });

  it('should call onenter callback for error state', () => {
    let callbackCalls = [];
    const machine = new LoadingStateMachine();
    
    machine.onenter = (state) => {
      callbackCalls.push(state);
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
    
    machine.onenter = (state) => {
      firstCalls.push(state);
    };

    machine.send(LOAD);
    expect(firstCalls).toEqual([STATE_LOADING]);

    // Change callback
    machine.onenter = (state) => {
      secondCalls.push(state);
    };

    machine.send(LOADED);
    expect(firstCalls).toEqual([STATE_LOADING]); // No more calls to first callback
    expect(secondCalls).toEqual([STATE_LOADED]); // New callback receives calls
  });
});
