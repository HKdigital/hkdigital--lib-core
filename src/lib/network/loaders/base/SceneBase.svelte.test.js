// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

import {
  STATE_INITIAL,
  STATE_LOADED,
  STATE_ABORTED,
  STATE_ERROR
} from '$lib/state/machines.js';

import SceneBase from './SceneBase.svelte.js';

// Mock concrete scene for testing
class TestScene extends SceneBase {
  #sources = $state([]);

  get sources() {
    return this.#sources;
  }

  getLoaderFromSource(source) {
    return source.loader;
  }

  addMockSource(label, loader) {
    this.#sources.push({ label, loader });
  }
}

// Mock loader
const createMockLoader = (initialState = STATE_INITIAL) => ({
  state: initialState,
  progress: { bytesLoaded: 0, size: 100, loaded: false },
  load: () => {},
  abort: () => {}
});

describe('SceneBase', () => {
  it('should throw errors when abstract methods are not implemented', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new SceneBase();
    });

    expect(() => scene.sources).toThrow('Subclass must implement sources getter');
    expect(() => scene.getLoaderFromSource({})).toThrow('Subclass must implement getLoaderFromSource method');
    
    cleanup();
  });

  it('should have correct initial state', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      expect(scene.state).toEqual(STATE_INITIAL);
      expect(scene.loaded).toEqual(false);
    });

    cleanup();
  });

  it('should calculate progress correctly with no sources', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      const progress = scene.progress;
      expect(progress.totalBytesLoaded).toEqual(0);
      expect(progress.totalSize).toEqual(0);
      expect(progress.sourcesLoaded).toEqual(0);
      expect(progress.numberOfSources).toEqual(0);
    });

    cleanup();
  });

  it('should calculate progress correctly with multiple sources', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      const loader1 = createMockLoader();
      loader1.progress = { bytesLoaded: 50, size: 100, loaded: true };
      
      const loader2 = createMockLoader();
      loader2.progress = { bytesLoaded: 25, size: 150, loaded: false };

      scene.addMockSource('source1', loader1);
      scene.addMockSource('source2', loader2);

      const progress = scene.progress;
      expect(progress.totalBytesLoaded).toEqual(75);
      expect(progress.totalSize).toEqual(250);
      expect(progress.sourcesLoaded).toEqual(1);
      expect(progress.numberOfSources).toEqual(2);
    });

    cleanup();
  });

  it('should calculate abort progress correctly', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      const loader1 = createMockLoader(STATE_ABORTED);
      const loader2 = createMockLoader(STATE_ERROR);
      const loader3 = createMockLoader(STATE_LOADED);

      scene.addMockSource('source1', loader1);
      scene.addMockSource('source2', loader2);
      scene.addMockSource('source3', loader3);

      const abortProgress = scene.abortProgress;
      expect(abortProgress.sourcesAborted).toEqual(2);
      expect(abortProgress.numberOfSources).toEqual(3);
    });

    cleanup();
  });

  it('should provide common loader interface methods', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      expect(typeof scene.load).toEqual('function');
      expect(typeof scene.abort).toEqual('function');
      expect(typeof scene.destroy).toEqual('function');
      expect(typeof scene.progress).toEqual('object');
      expect(typeof scene.abortProgress).toEqual('object');
    });

    cleanup();
  });
});
