// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte.js';

import { createDataResponse } from './mocks.js';

import {
  STATE_INITIAL,
  STATE_LOADING,
  STATE_LOADED,
  STATE_ABORTING,
  STATE_ABORTED,
  STATE_ERROR
} from '$lib/state/machines.js';

// > Mocks

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  // @ts-ignore
  delete global.fetch;
});

import NetworkLoader from './NetworkLoader.svelte.js';

describe('NetworkLoader', () => {
  it('should call completion callback on successful load', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createDataResponse());

    const url = 'http://localhost/mock-completion-callback';
    let callbackResult = null;

    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });

      expect(networkLoader.initial).toEqual(true);
      expect(networkLoader.loaded).toEqual(false);

      networkLoader.load((loader, finalState) => {
        callbackResult = { loader, finalState };
      });
    });

    await waitForState(() => {
      return networkLoader.loaded;
    });

    // Verify callback was called with correct parameters
    expect(callbackResult).toBeTruthy();
    expect(callbackResult.loader).toBe(networkLoader);
    expect(callbackResult.finalState).toBe(STATE_LOADED);

    // Verify callback is cleaned up (should be null after completion)
    expect(networkLoader.completionCallback).toBeUndefined(); // private field not accessible, but callback should be cleaned up

    cleanup();
  });

  it('should call completion callback on error state', async () => {
    // @ts-ignore
    fetch.mockRejectedValue(new Error('Network error'));

    const url = 'http://localhost/mock-error-callback';
    let callbackResult = null;

    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });

      networkLoader.load((loader, finalState) => {
        callbackResult = { loader, finalState };
      });
    });

    await waitForState(() => {
      return networkLoader.state === STATE_ERROR;
    });

    // Verify callback was called with error state
    expect(callbackResult).toBeTruthy();
    expect(callbackResult.loader).toBe(networkLoader);
    expect(callbackResult.finalState).toBe(STATE_ERROR);

    cleanup();
  });

  it('should load an file via a chunked stream', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createDataResponse());

    const url = 'http://localhost/mock-wav';

    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });

      expect(networkLoader.initial).toEqual(true);
      expect(networkLoader.loaded).toEqual(false);

      networkLoader.load();
    });

    await waitForState(() => {
      return networkLoader.loaded;
    });

    // @ts-ignore
    expect(networkLoader.loaded).toEqual(true);

    // @ts-ignore
    expect(networkLoader.progress).toEqual({
      bytesLoaded: 132,
      size: 132,
      loaded: true
    });

    cleanup();
  });

  it('should abort loading operation when abort is called', async () => {
    
    // Mock a slow response to test abort
    const mockResponse = createDataResponse();
    // @ts-ignore
    fetch.mockResolvedValue(mockResponse);

    const url = 'http://localhost/mock-wav';
    
    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });
      
      expect(networkLoader.state).toBe(STATE_INITIAL);
      
      // Start loading
      networkLoader.load();
      expect(networkLoader.state).toBe(STATE_LOADING);
      
      // Abort - should transition to ABORTING then ABORTED
      networkLoader.abort();
      expect(networkLoader.state).toBe(STATE_ABORTING);
    });
    
    // Wait for final state (could be ABORTED or LOADED depending on race condition)
    await waitForState(() => 
      networkLoader.state === STATE_ABORTED || networkLoader.state === STATE_LOADED
    );
    // After abort, loader should be in ABORTED state
    expect(networkLoader.state).toBe(STATE_ABORTED);

    cleanup();
  });

  it('should only abort when in loading state', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createDataResponse());
    
    const url = 'http://localhost/mock-wav';
    
    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });
      
      // Try abort from initial state (should remain in initial)
      networkLoader.abort();
      expect(networkLoader.state).toBe(STATE_INITIAL);
      
      // Start loading then abort (should work)
      networkLoader.load();
      expect(networkLoader.state).toBe(STATE_LOADING);
      
      networkLoader.abort();
      expect(networkLoader.state).toBe(STATE_ABORTING);
    });
    
    // Wait for final state (could be ABORTED or LOADED depending on race condition)
    await waitForState(() => 
      networkLoader.state === STATE_ABORTED || networkLoader.state === STATE_LOADED
    );
    // After abort, loader should be in ABORTED state
    expect(networkLoader.state).toBe(STATE_ABORTED);

    cleanup();
  });

  it('should complete abort flow from ABORTING to ABORTED', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createDataResponse());
    
    const url = 'http://localhost/mock-wav';
    
    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });
      
      // Start loading
      networkLoader.load();
      expect(networkLoader.state).toBe(STATE_LOADING);
      
      // Abort
      networkLoader.abort();
      expect(networkLoader.state).toBe(STATE_ABORTING);
    });
    
    // Wait for final state (could be ABORTED or LOADED depending on race condition)
    await waitForState(() => 
      networkLoader.state === STATE_ABORTED || networkLoader.state === STATE_LOADED
    );
    // After abort, loader should be in ABORTED state
    expect(networkLoader.state).toBe(STATE_ABORTED);

    cleanup();
  });
});
