// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte.js';

import {
  STATE_ABORTING,
  STATE_ABORTED
} from '$lib/state/machines.js';

import { createWavResponse } from './mocks.js';

// > Mocks

import { AudioContext } from 'standardized-audio-context-mock';

beforeEach(() => {
  // @ts-ignore
  global.AudioContext = AudioContext;
  global.fetch = vi.fn();
});

afterEach(() => {
  // @ts-ignore
  delete global.fetch;

  // @ts-ignore
  delete global.AudioContext;
});

import AudioScene from './AudioScene.svelte.js';

describe('AudioScene', () => {
  it('should load an audio scene', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createWavResponse());

    const TINY_SILENCE = 'tiny-silence-1';

    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      audioScene.defineMemorySource({
        label: TINY_SILENCE,
        url: 'http://localhost/not-a-real-url'
      });

      // expect(AudioScene.loaded).toEqual(false);

      // const audioContext = new AudioContext();

      // @ts-ignore
      audioScene.load();
    });

    await waitForState(() => {
      return audioScene.loaded;
    });

    // @ts-ignore
    expect(audioScene.loaded).toEqual(true);

    // Test progress calculation
    const progress = audioScene.progress;
    expect(progress.sourcesLoaded).toEqual(1);
    expect(progress.numberOfSources).toEqual(1);
    expect(progress.totalBytesLoaded).toBeGreaterThan(0);
    expect(progress.totalSize).toBeGreaterThan(0);

    cleanup();
  });

  it('should handle gain, mute and unmute operations', () => {
    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      // Test initial state
      expect(audioScene.getTargetGain()).toEqual(1);

      // Test setTargetGain functionality
      audioScene.setTargetGain(0.5);
      expect(audioScene.getTargetGain()).toEqual(0.5);

      // Test mute functionality
      audioScene.mute();
      expect(audioScene.getTargetGain()).toEqual(0);

      // Test unmute functionality - should restore previous gain value
      audioScene.unmute();
      expect(audioScene.getTargetGain()).toEqual(0.5);

      // Test mute when already muted (should not change behavior)
      audioScene.mute();
      audioScene.mute();
      expect(audioScene.getTargetGain()).toEqual(0);

      // Test setTargetGain to zero directly
      audioScene.unmute();
      audioScene.setTargetGain(0);
      expect(audioScene.getTargetGain()).toEqual(0);
    });

    cleanup();
  });

  it('should abort audio scene loading', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createWavResponse());

    const TINY_SILENCE = 'tiny-silence-1';

    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      audioScene.defineMemorySource({
        label: TINY_SILENCE,
        url: 'http://localhost/not-a-real-url'
      });

      // Start loading
      audioScene.load();
      
      // Abort immediately
      audioScene.abort();
      expect(audioScene.state).toBe(STATE_ABORTING);
    });

    await waitForState(() => {
      return audioScene.state === STATE_ABORTED;
    });

    // Verify abort completed successfully
    expect(audioScene.state).toEqual(STATE_ABORTED);

    cleanup();
  });

  it('should handle multiple sources with proper Response object handling', async () => {
    // Test for the Response reuse bug that causes preload hanging
    // @ts-ignore - Each fetch call needs a fresh Response object
    fetch.mockImplementation(() => Promise.resolve(createWavResponse()));

    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      // Define multiple sources - this would fail with Response reuse
      audioScene.defineMemorySource({
        label: 'sound1',
        url: 'http://localhost/sound1.wav'
      });
      
      audioScene.defineMemorySource({
        label: 'sound2', 
        url: 'http://localhost/sound2.wav'
      });
    });

    // Test preload completes successfully for all sources
    const { promise } = audioScene.preload({ timeoutMs: 1000 });
    
    const result = await promise;

    // Verify all sources loaded successfully
    expect(result).toBe(audioScene);
    expect(audioScene.loaded).toBe(true);
    
    const progress = audioScene.progress;
    expect(progress.sourcesLoaded).toBe(2);
    expect(progress.numberOfSources).toBe(2);
    expect(progress.totalBytesLoaded).toBeGreaterThan(0);
    
    cleanup();
  });

  it('should handle reactive state transitions correctly', async () => {
    // @ts-ignore - Each fetch call needs a fresh Response object
    fetch.mockImplementation(() => Promise.resolve(createWavResponse()));

    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      audioScene.defineMemorySource({
        label: 'sound1',
        url: 'http://localhost/sound1.wav'
      });
      
      audioScene.defineMemorySource({
        label: 'sound2', 
        url: 'http://localhost/sound2.wav'
      });
    });

    // Test preload completes successfully
    const { promise } = audioScene.preload({ timeoutMs: 1000 });
    
    const result = await promise;

    // Verify successful completion
    expect(result).toBe(audioScene);
    expect(audioScene.loaded).toBe(true);
    expect(audioScene.state).toBe('loaded');
    
    const progress = audioScene.progress;
    expect(progress.sourcesLoaded).toBe(2);
    expect(progress.numberOfSources).toBe(2);
    
    cleanup();
  });
});
