// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';

import FiniteStateMachine from './FiniteStateMachine.svelte.js';

describe('FiniteStateMachine - Basic Tests', () => {
  it('should handle basic state transitions', () => {
    const machine = new FiniteStateMachine('idle', {
      idle: {
        start: 'running'
      },
      running: {
        stop: 'idle',
        pause: 'paused'
      },
      paused: {
        resume: 'running',
        stop: 'idle'
      }
    });

    expect(machine.current).toBe('idle');
    
    machine.send('start');
    expect(machine.current).toBe('running');
    
    machine.send('pause');
    expect(machine.current).toBe('paused');
    
    machine.send('resume');
    expect(machine.current).toBe('running');
    
    machine.send('stop');
    expect(machine.current).toBe('idle');
  });

  it('should handle invalid transitions gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const machine = new FiniteStateMachine('idle', {
      idle: {
        start: 'running'
      },
      running: {
        stop: 'idle'
      }
    });

    expect(machine.current).toBe('idle');
    
    // Try invalid transition
    machine.send('invalidEvent');
    expect(machine.current).toBe('idle'); // Should stay in current state
    expect(consoleSpy).toHaveBeenCalledWith(
      'No action defined for event', 'invalidEvent', 'in state', 'idle'
    );

    consoleSpy.mockRestore();
  });

  it('should call enter and exit callbacks', () => {
    const callbacks = {
      enterIdle: vi.fn(),
      exitIdle: vi.fn(),
      enterRunning: vi.fn(),
      exitRunning: vi.fn()
    };

    const machine = new FiniteStateMachine('idle', {
      idle: {
        _enter: callbacks.enterIdle,
        _exit: callbacks.exitIdle,
        start: 'running'
      },
      running: {
        _enter: callbacks.enterRunning,
        _exit: callbacks.exitRunning,
        stop: 'idle'
      }
    });

    // Initial state should trigger enter
    expect(callbacks.enterIdle).toHaveBeenCalledTimes(1);

    machine.send('start');
    expect(callbacks.exitIdle).toHaveBeenCalledTimes(1);
    expect(callbacks.enterRunning).toHaveBeenCalledTimes(1);

    machine.send('stop');
    expect(callbacks.exitRunning).toHaveBeenCalledTimes(1);
    expect(callbacks.enterIdle).toHaveBeenCalledTimes(2);
  });
});

describe('FiniteStateMachine - Advanced Tests', () => {
  it('should handle same-state transitions', () => {
    let enterCallCount = 0;
    let exitCallCount = 0;

    const machine = new FiniteStateMachine('idle', {
      idle: {
        _enter: () => { enterCallCount++; },
        _exit: () => { exitCallCount++; },
        start: 'running',
        reset: 'idle' // Same state transition
      },
      running: {
        _enter: () => { enterCallCount++; },
        _exit: () => { exitCallCount++; },
        restart: 'running', // Same state transition
        stop: 'idle'
      }
    });

    expect(machine.current).toBe('idle');
    expect(enterCallCount).toBe(1); // Initial enter
    
    // Test same-state transition (should NOT trigger callbacks)
    machine.send('reset'); // idle → idle
    expect(machine.current).toBe('idle');
    expect(exitCallCount).toBe(0); // No exit callback
    expect(enterCallCount).toBe(1); // No additional enter callback
    
    machine.send('start'); // idle → running (different state)
    expect(machine.current).toBe('running');
    expect(exitCallCount).toBe(1); // Exit idle
    expect(enterCallCount).toBe(2); // Enter running
    
    // Test same-state transition on running (should NOT trigger callbacks)
    machine.send('restart'); // running → running  
    expect(machine.current).toBe('running');
    expect(exitCallCount).toBe(1); // No additional exit
    expect(enterCallCount).toBe(2); // No additional enter
  });

  it('should handle immediate state access after send()', () => {
    const machine = new FiniteStateMachine('idle', {
      idle: {
        start: 'loading'
      },
      loading: {
        complete: 'loaded'
      },
      loaded: {}
    });

    expect(machine.current).toBe('idle');
    
    const result1 = machine.send('start');
    expect(result1).toBe('loading');
    expect(machine.current).toBe('loading');
    
    const result2 = machine.send('complete');
    expect(result2).toBe('loaded'); 
    expect(machine.current).toBe('loaded');
  });

  it('should handle callback execution order', () => {
    let callOrder = [];

    const machine = new FiniteStateMachine('idle', {
      idle: {
        _enter: () => { callOrder.push('enter-idle'); },
        _exit: () => { callOrder.push('exit-idle'); },
        start: 'loading'
      },
      loading: {
        _enter: () => { callOrder.push('enter-loading'); },
        _exit: () => { callOrder.push('exit-loading'); },
        complete: 'loaded'
      },
      loaded: {
        _enter: () => { callOrder.push('enter-loaded'); }
      }
    });

    // Initial state should trigger enter
    expect(callOrder).toEqual(['enter-idle']);
    
    machine.send('start');
    expect(callOrder).toEqual(['enter-idle', 'exit-idle', 'enter-loading']);
    
    machine.send('complete');  
    expect(callOrder).toEqual(['enter-idle', 'exit-idle', 'enter-loading', 'exit-loading', 'enter-loaded']);
  });
});

describe('FiniteStateMachine - onexit/onenter Callbacks', () => {
  it('should call onexit callback when leaving states', () => {
    const exitCalls = [];
    
    const machine = new FiniteStateMachine('idle', {
      idle: { start: 'running' },
      running: { stop: 'idle', pause: 'paused' },
      paused: { resume: 'running' }
    });

    machine.onexit = (state, metadata) => {
      exitCalls.push({ state, from: metadata.from, to: metadata.to, event: metadata.event });
    };

    machine.send('start');
    machine.send('pause');
    machine.send('resume');

    expect(exitCalls).toEqual([
      { state: 'idle', from: 'idle', to: 'running', event: 'start' },
      { state: 'running', from: 'running', to: 'paused', event: 'pause' },
      { state: 'paused', from: 'paused', to: 'running', event: 'resume' }
    ]);
  });

  it('should call both onexit and onenter with correct execution order', () => {
    const callOrder = [];
    
    const machine = new FiniteStateMachine('idle', {
      idle: {
        _enter: () => callOrder.push('idle-_enter'),
        _exit: () => callOrder.push('idle-_exit'),
        start: 'running'
      },
      running: {
        _enter: () => callOrder.push('running-_enter'),
        _exit: () => callOrder.push('running-_exit'),
        stop: 'idle'
      }
    });

    machine.onexit = (state) => callOrder.push(`onexit-${state}`);
    machine.onenter = (state) => callOrder.push(`onenter-${state}`);

    // Clear the initial state entry calls
    callOrder.length = 0;

    machine.send('start');

    expect(callOrder).toEqual([
      'onexit-idle',        // 1. onexit callback
      'idle-_exit',         // 2. _exit function
      'running-_enter',     // 3. _enter function
      'onenter-running'     // 4. onenter callback
    ]);
  });

  it('should work without onexit callback set', () => {
    const machine = new FiniteStateMachine('idle', {
      idle: { start: 'running' },
      running: { stop: 'idle' }
    });

    // Should not throw errors when onexit is null
    expect(() => {
      machine.send('start');
      machine.send('stop');
    }).not.toThrow();

    expect(machine.current).toBe('idle');
  });

  it('should handle onexit callback changes during execution', () => {
    const firstExits = [];
    const secondExits = [];
    
    const machine = new FiniteStateMachine('idle', {
      idle: { start: 'running' },
      running: { stop: 'idle' }
    });

    machine.onexit = (state) => {
      firstExits.push(state);
    };

    machine.send('start');
    expect(firstExits).toEqual(['idle']);

    // Change callback
    machine.onexit = (state) => {
      secondExits.push(state);
    };

    machine.send('stop');
    expect(firstExits).toEqual(['idle']); // No more calls to first callback
    expect(secondExits).toEqual(['running']);
  });

  it('should pass correct metadata to onexit callback', () => {
    let exitMetadata = null;
    
    const machine = new FiniteStateMachine('idle', {
      idle: { start: 'running' },
      running: { stop: 'idle' }
    });

    machine.onexit = (state, metadata) => {
      exitMetadata = { state, ...metadata };
    };

    machine.send('start', 'arg1', 'arg2');

    expect(exitMetadata).toEqual({
      state: 'idle',
      from: 'idle',
      to: 'running', 
      event: 'start',
      args: ['arg1', 'arg2']
    });
  });
});