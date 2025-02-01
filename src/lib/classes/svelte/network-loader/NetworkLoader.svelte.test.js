// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

import { createDataResponse } from './mocks.js';

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
});
