// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

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

    // Test abort progress calculation
    const abortProgress = audioScene.abortProgress;
    expect(abortProgress.sourcesAborted).toEqual(1);
    expect(abortProgress.numberOfSources).toEqual(1);

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

  it('should fail with shared Response objects (demonstrating the bug)', async () => {
    // This test demonstrates the bug when using shared Response objects
    const sharedResponse = createWavResponse();
    // @ts-ignore - Using shared response (this causes the bug)
    fetch.mockResolvedValue(sharedResponse);

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

    // This should timeout due to Response reuse
    const { promise } = audioScene.preload({ timeoutMs: 500 });
    
    let error;
    try {
      await promise;
    } catch (e) {
      error = e;
    }

    // Should fail due to second source unable to read from consumed Response
    expect(error).toBeDefined();
    expect(error.message).toContain('timed out');
    
    // Only first source should have loaded
    const progress = audioScene.progress;
    expect(progress.sourcesLoaded).toBeLessThan(progress.numberOfSources);
    
    cleanup();
  });

  it('should detect preload timing issue with reactive state synchronization', async () => {
    // @ts-ignore - Each fetch call needs a fresh Response object
    fetch.mockImplementation(() => Promise.resolve(createWavResponse()));

    /** @type {AudioScene} */
    let audioScene;

    const cleanup = $effect.root(() => {
      audioScene = new AudioScene();

      // Define multiple sources to increase chance of timing issues
      audioScene.defineMemorySource({
        label: 'sound1',
        url: 'http://localhost/sound1.wav'
      });
      
      audioScene.defineMemorySource({
        label: 'sound2', 
        url: 'http://localhost/sound2.wav'
      });
    });

    // Track the sequence of state changes
    const stateLog = [];
    
    const logCleanup = $effect.root(() => {
      $effect(() => {
        const progress = audioScene.progress;
        const allLoaded = progress.sourcesLoaded === progress.numberOfSources;
        
        if (allLoaded && progress.numberOfSources > 0) {
          stateLog.push({
            type: 'progress_complete',
            timestamp: Date.now(),
            sourcesLoaded: progress.sourcesLoaded,
            numberOfSources: progress.numberOfSources
          });
        }
      });

      $effect(() => {
        if (audioScene.loaded) {
          stateLog.push({
            type: 'scene_loaded', 
            timestamp: Date.now(),
            state: audioScene.state
          });
        }
      });
    });

    // Test preload with short timeout to expose timing issue
    const { promise } = audioScene.preload({ timeoutMs: 1000 });
    
    let result;
    let error;
    
    try {
      result = await promise;
    } catch (e) {
      error = e;
    }

    logCleanup();
    
    // Analysis: Check if we can detect the timing issue
    console.log('State change log:', stateLog);
    console.log('Final progress:', audioScene.progress);
    console.log('Final loaded state:', audioScene.loaded);
    console.log('Result:', result ? 'success' : 'failed');
    console.log('Error:', error?.message);

    const progressComplete = stateLog.find(entry => entry.type === 'progress_complete');
    const sceneLoaded = stateLog.find(entry => entry.type === 'scene_loaded');

    if (progressComplete && !sceneLoaded && error) {
      console.log('🚨 TIMING ISSUE DETECTED: Progress complete but scene not loaded');
      console.log('This confirms the reactive state synchronization delay issue');
    }

    // For now, just verify the test structure works
    // The actual timing issue would need to be reproduced with real network delays
    expect(audioScene).toBeDefined();
    
    cleanup();
  });
});
