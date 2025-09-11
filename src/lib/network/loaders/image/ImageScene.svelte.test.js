// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

import {
  STATE_INITIAL,
  STATE_LOADING,
  STATE_LOADED,
  STATE_ABORTING,
  STATE_ABORTED,
  STATE_ERROR
} from '$lib/state/machines.js';

import { createPngResponse } from './mocks.js';

// > Mocks

beforeEach(() => {
  global.fetch = vi.fn();
  // Mock URL.createObjectURL for jsdom environment
  global.URL = global.URL || {};
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  // @ts-ignore
  delete global.fetch;
  // @ts-ignore
  delete global.URL.createObjectURL;
  // @ts-ignore
  delete global.URL.revokeObjectURL;
});

import ImageScene from './ImageScene.svelte.js';

describe('ImageScene', () => {
  it('should load an image scene with single image', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    const TEST_IMAGE = 'test-image-1';

    /** @type {ImageScene} */
    let imageScene;

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      imageScene.defineImage({
        label: TEST_IMAGE,
        imageSource: [{ src: 'http://localhost/test-image.png', width: 100, height: 100 }]
      });

      expect(imageScene.loaded).toEqual(false);
      expect(imageScene.state).toEqual(STATE_INITIAL);

      imageScene.load();
    });

    await waitForState(() => {
      return imageScene.loaded;
    });

    expect(imageScene.loaded).toEqual(true);
    expect(imageScene.state).toEqual(STATE_LOADED);

    // Test progress calculation
    const progress = imageScene.progress;
    expect(progress.sourcesLoaded).toEqual(1);
    expect(progress.numberOfSources).toEqual(1);
    expect(progress.totalBytesLoaded).toEqual(67);
    expect(progress.totalSize).toEqual(67);

    // Test getting image meta and object URL
    const imageMeta = imageScene.getImageMeta(TEST_IMAGE);
    expect(imageMeta).toBeTruthy();

    const objectURL = imageScene.getObjectURL(TEST_IMAGE);
    expect(typeof objectURL).toEqual('string');
    expect(objectURL.startsWith('blob:')).toEqual(true);

    cleanup();
  });

  it('should load an image scene with multiple images', async () => {
    // @ts-ignore 
    // Create separate responses to avoid ReadableStream lock issues
    fetch.mockImplementation(() => Promise.resolve(createPngResponse()));

    const TEST_IMAGE_1 = 'test-image-1';
    const TEST_IMAGE_2 = 'test-image-2';
    const TEST_IMAGE_3 = 'test-image-3';

    /** @type {ImageScene} */
    let imageScene;

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      imageScene.defineImage({
        label: TEST_IMAGE_1,
        imageSource: [{ src: 'http://localhost/test-image-1.png', width: 100, height: 100 }]
      });

      imageScene.defineImage({
        label: TEST_IMAGE_2,
        imageSource: [{ src: 'http://localhost/test-image-2.png', width: 200, height: 200 }]
      });

      imageScene.defineImage({
        label: TEST_IMAGE_3,
        imageSource: [{ src: 'http://localhost/test-image-3.png', width: 300, height: 300 }]
      });

      expect(imageScene.loaded).toEqual(false);
      expect(imageScene.state).toEqual(STATE_INITIAL);

      imageScene.load();
    });

    await waitForState(() => {
      return imageScene.loaded;
    }, 3000);

    expect(imageScene.loaded).toEqual(true);
    expect(imageScene.state).toEqual(STATE_LOADED);

    // Test progress calculation for multiple sources
    const progress = imageScene.progress;
    expect(progress.sourcesLoaded).toEqual(3);
    expect(progress.numberOfSources).toEqual(3);
    expect(progress.totalBytesLoaded).toEqual(201); // 67 * 3
    expect(progress.totalSize).toEqual(201);

    // Test accessing each image
    expect(() => imageScene.getImageMeta(TEST_IMAGE_1)).not.toThrow();
    expect(() => imageScene.getImageMeta(TEST_IMAGE_2)).not.toThrow();
    expect(() => imageScene.getImageMeta(TEST_IMAGE_3)).not.toThrow();

    cleanup();
  });

  it('should handle state machine transitions correctly', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    const TEST_IMAGE = 'test-image';

    /** @type {ImageScene} */
    let imageScene;
    const stateTransitions = [];

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      // Track state transitions
      $effect(() => {
        stateTransitions.push(imageScene.state);
      });

      imageScene.defineImage({
        label: TEST_IMAGE,
        imageSource: [{ src: 'http://localhost/test-image.png', width: 100, height: 100 }]
      });

      expect(imageScene.state).toEqual(STATE_INITIAL);
      
      imageScene.load();
    });

    await waitForState(() => {
      return imageScene.loaded;
    });

    expect(imageScene.state).toEqual(STATE_LOADED);
    
    // Check that we went through the expected state transitions
    expect(stateTransitions).toContain(STATE_LOADING);
    expect(stateTransitions).toContain(STATE_LOADED);

    cleanup();
  });

  it('should properly handle progress tracking during loading', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    const TEST_IMAGE = 'test-image';

    /** @type {ImageScene} */
    let imageScene;
    const progressSnapshots = [];

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      // Track progress changes
      $effect(() => {
        const progress = imageScene.progress;
        progressSnapshots.push({
          state: imageScene.state,
          sourcesLoaded: progress.sourcesLoaded,
          numberOfSources: progress.numberOfSources
        });
      });

      imageScene.defineImage({
        label: TEST_IMAGE,
        imageSource: [{ src: 'http://localhost/test-image.png', width: 100, height: 100 }]
      });

      imageScene.load();
    });

    await waitForState(() => {
      return imageScene.loaded;
    });

    expect(progressSnapshots.length).toBeGreaterThan(0);
    
    // Find the final progress snapshot
    const finalProgress = progressSnapshots[progressSnapshots.length - 1];
    expect(finalProgress.sourcesLoaded).toEqual(1);
    expect(finalProgress.numberOfSources).toEqual(1);
    expect(finalProgress.state).toEqual(STATE_LOADED);

    cleanup();
  });

  it('should handle invalid image source references', () => {
    /** @type {ImageScene} */
    let imageScene;

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      imageScene.defineImage({
        label: 'valid-image',
        imageSource: [{ src: 'http://localhost/image.png', width: 100, height: 100 }]
      });
    });

    // Test getting non-existent image
    expect(() => {
      imageScene.getImageMeta('non-existent-image');
    }).toThrow('Source [non-existent-image] has not been defined');

    expect(() => {
      imageScene.getObjectURL('non-existent-image');
    }).toThrow('Source [non-existent-image] has not been defined');

    expect(() => {
      imageScene.getImageLoader('non-existent-image');
    }).toThrow('Source [non-existent-image] has not been defined');

    cleanup();
  });

  it('should abort image scene loading', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    const TEST_IMAGE = 'test-image-1';

    /** @type {ImageScene} */
    let imageScene;

    const cleanup = $effect.root(() => {
      imageScene = new ImageScene();

      imageScene.defineImage({
        label: TEST_IMAGE,
        imageSource: [{ src: 'http://localhost/test-image.png', width: 100, height: 100 }]
      });

      // Start loading
      imageScene.load();
      
      // Abort immediately
      imageScene.abort();
      expect(imageScene.state).toBe(STATE_ABORTING);
    });

    await waitForState(() => {
      return imageScene.state === STATE_ABORTED;
    });

    // Verify abort completed successfully
    expect(imageScene.state).toEqual(STATE_ABORTED);

    cleanup();
  });
});
