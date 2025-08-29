// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

import { createDataResponse } from './mocks.js';

import {
  STATE_INITIAL,
  STATE_LOADING,
  STATE_CANCELLED
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

  it('should abort loading operation when doAbort is called', async () => {
    
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
      
      // Abort immediately
      networkLoader.doAbort();
      expect(networkLoader.state).toBe(STATE_CANCELLED);
    });

    cleanup();
  });

  it('should only abort when in loading state', () => {
    
    const url = 'http://localhost/mock-wav';
    
    /** @type {NetworkLoader} */
    let networkLoader;

    const cleanup = $effect.root(() => {
      networkLoader = new NetworkLoader({ url });
      
      // Try abort from initial state (should remain in initial)
      networkLoader.doAbort();
      expect(networkLoader.state).toBe(STATE_INITIAL);
      
      // Start loading then abort (should work)
      networkLoader.load();
      expect(networkLoader.state).toBe(STATE_LOADING);
      
      networkLoader.doAbort();
      expect(networkLoader.state).toBe(STATE_CANCELLED);
    });

    cleanup();
  });
});
