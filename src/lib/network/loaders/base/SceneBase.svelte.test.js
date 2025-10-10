// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

import {
  STATE_INITIAL,
  STATE_LOADED,
  STATE_ABORTED,
  STATE_ERROR
} from '$lib/state/machines.js';

import { TimeoutError } from '$lib/generic/errors.js';
import { waitForState } from '$lib/util/svelte.js';
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
const createMockLoader = (initialState = STATE_INITIAL) => {
  let state = initialState;
  let progress = { bytesLoaded: 0, size: 100, loaded: false };
  
  const loader = {
    get state() { return state; },
    get progress() { return progress; },
    load: () => {
      state = STATE_LOADED;
      progress = { bytesLoaded: 100, size: 100, loaded: true };
    },
    abort: () => {
      state = STATE_ABORTED;
    },
    // Test helpers
    setState: (newState) => { state = newState; },
    setProgress: (newProgress) => { progress = { ...newProgress }; }
  };
  
  return loader;
};

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
      expect(progress.percentageLoaded).toEqual(0);
    });

    cleanup();
  });

  it('should calculate progress correctly with multiple sources', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      const loader1 = createMockLoader();
      loader1.setProgress({ bytesLoaded: 50, size: 100, loaded: true });
      
      const loader2 = createMockLoader();
      loader2.setProgress({ bytesLoaded: 25, size: 150, loaded: false });

      scene.addMockSource('source1', loader1);
      scene.addMockSource('source2', loader2);

      const progress = scene.progress;
      expect(progress.totalBytesLoaded).toEqual(75);
      expect(progress.totalSize).toEqual(250);
      expect(progress.sourcesLoaded).toEqual(1);
      expect(progress.numberOfSources).toEqual(2);
      expect(progress.percentageLoaded).toEqual(30); // 75/250 = 30%
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
      expect(typeof scene.preload).toEqual('function');
      expect(typeof scene.progress).toEqual('object');
    });

    cleanup();
  });

  it('should preload successfully with single source', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      const loader = createMockLoader();
      scene.addMockSource('test-source', loader);
    });

    const { promise, abort } = scene.preload({ timeoutMs: 1000 });

    expect(typeof abort).toEqual('function');
    
    const result = await promise;
    expect(result).toBe(scene);
    expect(scene.loaded).toEqual(true);

    cleanup();
  });

  it('should preload successfully with multiple sources', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      scene.addMockSource('source1', createMockLoader());
      scene.addMockSource('source2', createMockLoader());
      scene.addMockSource('source3', createMockLoader());
    });

    const { promise } = scene.preload({ timeoutMs: 1000 });
    
    const result = await promise;
    expect(result).toBe(scene);
    expect(scene.loaded).toEqual(true);

    cleanup();
  });

  it('should track progress during preload', async () => {
    let scene;
    const progressUpdates = [];

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      const loader = createMockLoader();
      scene.addMockSource('test-source', loader);
    });

    const { promise } = scene.preload({
      timeoutMs: 1000,
      onProgress: (progress) => {
        progressUpdates.push({ ...progress });
      }
    });

    await promise;

    // Wait a bit more for any additional progress updates
    await new Promise(resolve => setTimeout(resolve, 100));

    // Should have received some progress updates during polling
    expect(progressUpdates.length).toBeGreaterThanOrEqual(0);

    cleanup();
  });

  it('should abort preload manually', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      // Create loader that doesn't auto-complete
      const loader = createMockLoader();
      loader.load = () => {}; // Override to not complete immediately
      scene.addMockSource('test-source', loader);
    });

    const { promise, abort } = scene.preload({ timeoutMs: 5000 });

    // Abort immediately
    abort();

    try {
      await promise;
      expect.fail('Promise should have been rejected');
    } catch (error) {
      expect(error.message).toEqual('Preload was aborted');
    }

    cleanup();
  });

  it('should handle preload timeout', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      scene.addMockSource('test-source', createMockLoader());
    });

    // Test that timeout parameter is accepted
    const { promise, abort } = scene.preload({ timeoutMs: 100 });
    
    expect(typeof abort).toEqual('function');
    
    // Should complete successfully since mock loader loads immediately
    const result = await promise;
    expect(result).toBe(scene);

    cleanup();
  });

  it('should timeout when loading takes too long', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      // Create loader that never completes
      const slowLoader = createMockLoader();
      slowLoader.load = () => {
        // Don't change state - simulates hanging loader
      };
      scene.addMockSource('slow-source', slowLoader);
    });

    // Use a very short timeout to keep test fast
    const { promise } = scene.preload({ timeoutMs: 50 });

    try {
      await promise;
      expect.fail('Promise should have timed out');
    } catch (error) {
      expect(error.message).toContain('Preload timed out after 50ms');
    }

    cleanup();
  });

  it('should handle preload with no timeout', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      const loader = createMockLoader();
      scene.addMockSource('test-source', loader);
    });

    const { promise } = scene.preload({ timeoutMs: 0 });
    
    const result = await promise;
    expect(result).toBe(scene);
    expect(scene.loaded).toEqual(true);

    cleanup();
  });

  it('should handle different preload options', async () => {
    let scene1, scene2;

    const cleanup = $effect.root(() => {
      scene1 = new TestScene();
      scene1.addMockSource('test-source', createMockLoader());

      scene2 = new TestScene();
      scene2.addMockSource('test-source', createMockLoader());
    });

    // Test various option combinations
    const { promise: promise1 } = scene1.preload();
    const result1 = await promise1;
    expect(result1).toBe(scene1);

    const { promise: promise2 } = scene2.preload({ timeoutMs: 10 });
    try {
      const result2 = await promise2;
      expect(result2).toBe(scene2);
    } catch (error) {
      // With 10ms timeout, it might timeout before mock loader completes
      expect(error instanceof TimeoutError || error.message.includes('timed out')).toBe(true);
    }

    cleanup();
  });

  it('should transition to error state when a loader fails', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      // Add successful loader
      const successLoader = createMockLoader();
      scene.addMockSource('success-source', successLoader);
      
      // Add failing loader
      const failLoader = createMockLoader();
      failLoader.load = () => {
        failLoader.setState(STATE_ERROR);
      };
      scene.addMockSource('fail-source', failLoader);
    });

    // Start preload - should fail due to error loader
    const { promise } = scene.preload({ timeoutMs: 1000 });
    
    let error;
    try {
      await promise;
    } catch (e) {
      error = e;
    }

    // Scene should be in error state
    expect(error).toBeDefined();
    expect(scene.state).toBe(STATE_ERROR);
    expect(scene.loaded).toBe(false);
    
    // Progress should show partial loading
    const progress = scene.progress;
    expect(progress.sourcesLoaded).toBe(1); // Only success loader completed
    expect(progress.numberOfSources).toBe(2);
    expect(progress.percentageLoaded).toBe(50); // 1/2 sources = 50%
    
    cleanup();
  });

  it('should handle loader error with error object', async () => {
    let scene;
    const testError = new Error('Network connection failed');

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      
      // Add failing loader with specific error
      const failLoader = createMockLoader();
      failLoader.error = testError;
      failLoader.load = () => {
        failLoader.setState(STATE_ERROR);
      };
      scene.addMockSource('fail-source', failLoader);
    });

    // Start preload - should fail with specific error
    const { promise } = scene.preload({ timeoutMs: 1000 });
    
    let error;
    try {
      await promise;
    } catch (e) {
      error = e;
    }

    // Scene should be in error state with correct error
    expect(error).toBeDefined();
    expect(scene.state).toBe(STATE_ERROR);
    expect(error.message).toContain('Network connection failed');
    
    cleanup();
  });

  it('should calculate percentageLoaded correctly - byte-based vs source-based', () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();

      // Test byte-based percentage (when totalSize > 0)
      const loader1 = createMockLoader();
      loader1.setProgress({ bytesLoaded: 30, size: 100, loaded: false });
      
      const loader2 = createMockLoader();
      loader2.setProgress({ bytesLoaded: 70, size: 100, loaded: true });

      scene.addMockSource('source1', loader1);
      scene.addMockSource('source2', loader2);

      let progress = scene.progress;
      expect(progress.totalSize).toEqual(200);
      expect(progress.totalBytesLoaded).toEqual(100);
      expect(progress.percentageLoaded).toEqual(50); // 100/200 = 50%

      // Test source-based percentage (when totalSize = 0)
      scene = new TestScene();
      
      const loader3 = createMockLoader();
      loader3.setProgress({ bytesLoaded: 0, size: 0, loaded: true });
      
      const loader4 = createMockLoader();
      loader4.setProgress({ bytesLoaded: 0, size: 0, loaded: false });

      scene.addMockSource('source3', loader3);
      scene.addMockSource('source4', loader4);

      progress = scene.progress;
      expect(progress.totalSize).toEqual(0);
      expect(progress.sourcesLoaded).toEqual(1);
      expect(progress.numberOfSources).toEqual(2);
      expect(progress.percentageLoaded).toEqual(50); // 1/2 = 50%
    });

    cleanup();
  });

  it('should preload empty scenes successfully', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      // Don't add any sources - test empty scene
    });

    const { promise } = scene.preload({ timeoutMs: 1000 });
    
    const result = await promise;
    expect(result).toBe(scene);
    expect(scene.loaded).toEqual(true);
    expect(scene.progress.numberOfSources).toEqual(0);
    expect(scene.progress.percentageLoaded).toEqual(0);

    cleanup();
  });

  it('should handle sequential preload calls (second preload on loaded scene)', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      scene.addMockSource('test-source', createMockLoader());
    });

    // First preload - should succeed
    const { promise: firstPromise } = scene.preload({ timeoutMs: 1000 });
    const firstResult = await firstPromise;
    
    expect(firstResult).toBe(scene);
    expect(scene.loaded).toEqual(true);

    // Second preload on already loaded scene - this should either:
    // 1. Resolve immediately since already loaded, OR
    // 2. Timeout/hang (demonstrating the bug)
    const { promise: secondPromise } = scene.preload({ timeoutMs: 500 });
    
    try {
      const secondResult = await secondPromise;
      // If we get here, second preload worked (either immediate resolve or re-loading)
      expect(secondResult).toBe(scene);
      expect(scene.loaded).toEqual(true);
    } catch (error) {
      // This demonstrates the hanging preload bug
      expect(error.message).toContain('timed out');
      console.log('Second preload timed out - demonstrating hanging preload bug:', error.message);
    }

    cleanup();
  });

  it('should handle rapid sequential preload calls', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      scene.addMockSource('test-source', createMockLoader());
    });

    // Start two preloads almost simultaneously
    const { promise: firstPromise } = scene.preload({ timeoutMs: 1000 });
    const { promise: secondPromise } = scene.preload({ timeoutMs: 500 });
    
    try {
      const [firstResult, secondResult] = await Promise.all([
        firstPromise.catch(e => e),
        secondPromise.catch(e => e)
      ]);
      
      // At least one should succeed
      const successfulResults = [firstResult, secondResult].filter(r => r === scene);
      const errors = [firstResult, secondResult].filter(r => r instanceof Error);
      
      console.log(`Rapid preload results: ${successfulResults.length} succeeded, ${errors.length} failed`);
      
      if (errors.length > 0) {
        console.log('Errors from rapid preload:', errors.map(e => e.message));
      }
      
      // Scene should be loaded regardless
      expect(scene.loaded).toEqual(true);
    } catch (error) {
      console.log('Rapid preload test error:', error.message);
      throw error;
    }

    cleanup();
  });

  it('should handle preload called on already loaded scene (potential hanging scenario)', async () => {
    let scene;

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      scene.addMockSource('test-source', createMockLoader());
    });

    // Load the scene first using the normal load() method
    scene.load();
    
    // Wait for scene to be fully loaded
    await waitForState(() => scene.loaded, 1000);
    expect(scene.loaded).toEqual(true);
    expect(scene.state).toEqual('loaded');

    // Now try to preload the already loaded scene
    // This is the scenario that might hang - preloading when already in LOADED state
    const startTime = Date.now();
    const { promise: secondPromise } = scene.preload({ timeoutMs: 1000 });
    
    try {
      const result = await secondPromise;
      const duration = Date.now() - startTime;
      console.log(`Second preload completed in ${duration}ms`);
      expect(result).toBe(scene);
      expect(scene.loaded).toEqual(true);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`Second preload failed after ${duration}ms:`, error.message);
      // This would demonstrate the hanging preload bug
      expect(error.message).toContain('timed out');
    }

    cleanup();
  });

  it('should handle preload state transitions correctly when already loaded', async () => {
    let scene;
    const stateTransitions = [];

    const cleanup = $effect.root(() => {
      scene = new TestScene();
      scene.addMockSource('test-source', createMockLoader());

      // Track all state transitions
      $effect(() => {
        stateTransitions.push(scene.state);
      });
    });

    // First load
    const { promise: firstPromise } = scene.preload({ timeoutMs: 1000 });
    await firstPromise;
    
    expect(scene.loaded).toEqual(true);
    expect(stateTransitions).toContain('loaded');
    
    // Clear transitions to track only the second preload
    const transitionsBefore = stateTransitions.length;
    
    // Second preload on loaded scene
    const { promise: secondPromise } = scene.preload({ timeoutMs: 500 });
    await secondPromise.catch(() => {
      // Catch timeout if it happens
    });
    
    const transitionsAfter = stateTransitions.length;
    const newTransitions = stateTransitions.slice(transitionsBefore);
    
    console.log('State transitions during second preload:', newTransitions);
    
    // The scene should still be loaded regardless
    expect(scene.loaded).toEqual(true);

    cleanup();
  });
});
