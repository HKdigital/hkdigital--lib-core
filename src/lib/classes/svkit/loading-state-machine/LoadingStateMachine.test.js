import { describe, it, expect } from 'vitest';

import LoadingStateMachine from './LoadingStateMachine.svelte.js';

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
