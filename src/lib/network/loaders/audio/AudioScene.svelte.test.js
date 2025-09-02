// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

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
});
