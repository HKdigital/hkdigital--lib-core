// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushSync } from 'svelte';

import ReactiveDataStore from './ReactiveDataStore.svelte.js';

// Data key constants
const KEY_SCORE = 'score';
const KEY_LEVEL = 'level';
const KEY_COMPLETED = 'completed';
const KEY_PLAYER_NAME = 'player-name';
const KEY_TEMP = 'temp';
const KEY_OTHER_DATA = 'other-data';

describe('ReactiveDataStore - Basic Operations', () => {
  it('should initialize empty by default', () => {
    const store = new ReactiveDataStore();

    expect(store.size).toBe(0);
  });

  it('should initialize with initial data', () => {
    const store = new ReactiveDataStore({
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_COMPLETED]: false
      }
    });

    expect(store.get(KEY_SCORE)).toBe(0);
    expect(store.get(KEY_COMPLETED)).toBe(false);
    expect(store.size).toBe(2);
  });

  it('should set and get data properties', () => {
    const store = new ReactiveDataStore();

    store.set(KEY_SCORE, 100);
    expect(store.get(KEY_SCORE)).toBe(100);

    store.set(KEY_PLAYER_NAME, 'Alice');
    expect(store.get(KEY_PLAYER_NAME)).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const store = new ReactiveDataStore();

    store.update({
      [KEY_SCORE]: 100,
      [KEY_LEVEL]: 5,
      [KEY_COMPLETED]: true
    });

    expect(store.get(KEY_SCORE)).toBe(100);
    expect(store.get(KEY_LEVEL)).toBe(5);
    expect(store.get(KEY_COMPLETED)).toBe(true);
  });

  it('should get all data properties', () => {
    const store = new ReactiveDataStore({
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_LEVEL]: 1
      }
    });

    store.set(KEY_COMPLETED, false);

    const allData = store.getAll();
    expect(allData).toEqual({
      [KEY_SCORE]: 0,
      [KEY_LEVEL]: 1,
      [KEY_COMPLETED]: false
    });
  });

  it('should delete data properties', () => {
    const store = new ReactiveDataStore();

    store.set(KEY_TEMP, 'value');
    expect(store.has(KEY_TEMP)).toBe(true);

    const deleted = store.delete(KEY_TEMP);
    expect(deleted).toBe(true);
    expect(store.has(KEY_TEMP)).toBe(false);
  });

  it('should check if data properties exist', () => {
    const store = new ReactiveDataStore();

    expect(store.has(KEY_SCORE)).toBe(false);

    store.set(KEY_SCORE, 100);
    expect(store.has(KEY_SCORE)).toBe(true);
  });

  it('should clear all data properties', () => {
    const KEY_A = 'a';
    const KEY_B = 'b';
    const KEY_C = 'c';

    const store = new ReactiveDataStore({
      initialData: {
        [KEY_A]: 1,
        [KEY_B]: 2,
        [KEY_C]: 3
      }
    });

    expect(store.size).toBe(3);

    store.clear();
    expect(store.size).toBe(0);
    expect(store.has(KEY_A)).toBe(false);
  });

  it('should track data size', () => {
    const KEY_A = 'a';
    const KEY_B = 'b';
    const store = new ReactiveDataStore();

    expect(store.size).toBe(0);

    store.set(KEY_A, 1);
    expect(store.size).toBe(1);

    store.set(KEY_B, 2);
    expect(store.size).toBe(2);

    store.delete(KEY_A);
    expect(store.size).toBe(1);
  });
});

describe('ReactiveDataStore - Strict Mode', () => {
  it('should throw error for uninitialized data properties', () => {
    const store = new ReactiveDataStore();
    const KEY_NONEXISTENT = 'nonexistent';

    expect(() => store.get(KEY_NONEXISTENT)).toThrow(
      'Data key "nonexistent" is not initialized.'
    );
  });

  it('should throw error for data properties after deletion', () => {
    const store = new ReactiveDataStore({
      initialData: { [KEY_TEMP]: 'value' }
    });

    store.delete(KEY_TEMP);

    expect(() => store.get(KEY_TEMP)).toThrow(
      'Data key "temp" is not initialized.'
    );
  });

  it('should use custom error prefix', () => {
    const store = new ReactiveDataStore({
      errorPrefix: 'Custom prefix'
    });

    expect(() => store.get(KEY_SCORE)).toThrow(
      'Custom prefix "score" is not initialized.'
    );
  });

  it('should allow disabling strict mode', () => {
    const store = new ReactiveDataStore({
      strictMode: false
    });

    // Should not throw, returns undefined
    expect(store.get('nonexistent')).toBeUndefined();
  });
});

describe('ReactiveDataStore - Reactivity', () => {
  it('should trigger effect when data changes (fine-grained)', () => {
    const store = new ReactiveDataStore({
      initialData: { [KEY_SCORE]: 0 }
    });
    let effectRunCount = 0;
    let lastScoreValue = null;

    // Create effect watching SCORE
    const cleanup = $effect.root(() => {
      $effect(() => {
        lastScoreValue = store.get(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change SCORE - should trigger effect
    store.set(KEY_SCORE, 100);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastScoreValue).toBe(100);

    // Change SCORE again - should trigger effect again
    store.set(KEY_SCORE, 200);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 2);
    expect(lastScoreValue).toBe(200);

    cleanup();
  });

  it('should NOT trigger effect when unrelated data changes', () => {
    const store = new ReactiveDataStore({
      initialData: { [KEY_SCORE]: 0 }
    });
    let effectRunCount = 0;

    // Create effect watching only SCORE
    const cleanup = $effect.root(() => {
      $effect(() => {
        store.get(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change OTHER_DATA - should NOT trigger effect
    store.set(KEY_OTHER_DATA, 'value');
    flushSync();

    expect(effectRunCount).toBe(initialCount);

    cleanup();
  });

  it('should trigger effect on has() checks', () => {
    const store = new ReactiveDataStore();
    let effectRunCount = 0;
    let lastHasValue = null;

    const cleanup = $effect.root(() => {
      $effect(() => {
        lastHasValue = store.has(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;
    expect(lastHasValue).toBe(false);

    // Add key - should trigger effect
    store.set(KEY_SCORE, 100);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastHasValue).toBe(true);

    cleanup();
  });
});

describe('ReactiveDataStore - Production Guard (Dev-only data)', () => {
  it('should initialize dev data in dev mode', () => {
    const store = new ReactiveDataStore({
      initialData: { autoNav: true },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    // In test env (dev mode), should work
    expect(store.get('autoNav')).toBe(true);
    expect(store.size).toBe(1);
  });

  it('should set and get dev data in dev mode', () => {
    const store = new ReactiveDataStore({
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    store.set('autoNav', true);
    expect(store.get('autoNav')).toBe(true);

    store.set('skipAnimations', false);
    expect(store.get('skipAnimations')).toBe(false);
  });

  it('should update multiple dev data properties', () => {
    const store = new ReactiveDataStore({
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    store.update({
      autoNav: true,
      skipAnimations: false,
      mockApi: 'localhost'
    });

    expect(store.get('autoNav')).toBe(true);
    expect(store.get('skipAnimations')).toBe(false);
    expect(store.get('mockApi')).toBe('localhost');
  });

  it('should delete dev data properties', () => {
    const store = new ReactiveDataStore({
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    store.set('temp', 'value');
    expect(store.has('temp')).toBe(true);

    const deleted = store.delete('temp');
    expect(deleted).toBe(true);
    expect(store.has('temp')).toBe(false);
  });

  it('should handle complex dev data values', () => {
    const store = new ReactiveDataStore({
      initialData: {
        mockApi: { url: 'initial', port: 0 },
        debugFlags: [],
        autoNav: true,
        nullValue: null
      },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    // Object value
    const mockConfig = { url: 'localhost', port: 3000 };
    store.set('mockApi', mockConfig);
    expect(store.get('mockApi')).toEqual(mockConfig);

    // Array value
    const debugFlags = ['verbose', 'trace', 'profile'];
    store.set('debugFlags', debugFlags);
    expect(store.get('debugFlags')).toEqual(debugFlags);

    // Boolean value
    store.set('autoNav', false);
    expect(store.get('autoNav')).toBe(false);

    // Null value
    store.set('nullValue', null);
    expect(store.get('nullValue')).toBe(null);
  });
});

describe('ReactiveDataStore - Dev Data Reactivity', () => {
  it('should trigger effect when dev data changes', () => {
    const store = new ReactiveDataStore({
      initialData: { autoNav: false },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });
    let effectRunCount = 0;
    let lastValue = null;

    const cleanup = $effect.root(() => {
      $effect(() => {
        lastValue = store.get('autoNav');
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change dev data - should trigger effect
    store.set('autoNav', true);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastValue).toBe(true);

    // Change dev data again - should trigger effect again
    store.set('autoNav', false);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 2);
    expect(lastValue).toBe(false);

    cleanup();
  });

  it('should NOT trigger effect when unrelated dev data changes', () => {
    const store = new ReactiveDataStore({
      initialData: {
        autoNav: false,
        skipAnimations: false
      },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });
    let effectRunCount = 0;

    // Create effect watching only autoNav
    const cleanup = $effect.root(() => {
      $effect(() => {
        store.get('autoNav');
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change skipAnimations - should NOT trigger effect
    store.set('skipAnimations', true);
    flushSync();

    expect(effectRunCount).toBe(initialCount);

    cleanup();
  });
});

describe('ReactiveDataStore - Separation of Concerns', () => {
  it('should keep separate stores independent', () => {
    const dataStore = new ReactiveDataStore();
    const devStore = new ReactiveDataStore({
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });

    // Set regular data
    dataStore.set(KEY_SCORE, 100);

    // Set dev data with similar-looking key
    devStore.set('score', 999);

    // Regular data should be unaffected
    expect(dataStore.get(KEY_SCORE)).toBe(100);
    expect(devStore.get('score')).toBe(999);

    // Sizes should be independent
    expect(dataStore.size).toBe(1);
    expect(devStore.size).toBe(1);
  });

  it('should NOT trigger regular data effects when dev data changes', () => {
    const dataStore = new ReactiveDataStore({
      initialData: { [KEY_SCORE]: 0 }
    });
    const devStore = new ReactiveDataStore({
      initialData: { autoNav: false },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });
    let dataEffectRunCount = 0;

    // Effect watching regular data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        dataStore.get(KEY_SCORE);
        dataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = dataEffectRunCount;

    // Change dev data - should NOT trigger regular data effect
    devStore.set('autoNav', true);
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount);

    // Change regular data - SHOULD trigger effect
    dataStore.set(KEY_SCORE, 100);
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount + 1);

    cleanup();
  });

  it('should NOT trigger dev data effects when regular data changes', () => {
    const dataStore = new ReactiveDataStore();
    const devStore = new ReactiveDataStore({
      initialData: { autoNav: false },
      productionGuard: true,
      errorPrefix: 'Dev data key'
    });
    let devDataEffectRunCount = 0;

    // Effect watching dev data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        devStore.get('autoNav');
        devDataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = devDataEffectRunCount;

    // Change regular data - should NOT trigger dev data effect
    dataStore.set(KEY_SCORE, 100);
    flushSync();

    expect(devDataEffectRunCount).toBe(initialCount);

    cleanup();
  });
});
