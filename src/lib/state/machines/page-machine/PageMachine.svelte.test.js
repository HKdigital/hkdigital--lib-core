// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';

import PageMachine from './PageMachine.svelte.js';

// Data key constants (best practice - use KEY_ prefix)
const KEY_SCORE = 'score';
const KEY_LEVEL = 'level';
const KEY_COMPLETED = 'completed';
const KEY_PLAYER_NAME = 'player-name';
const KEY_TUTORIAL_SEEN = 'tutorial-seen';
const KEY_LEVELS_COMPLETED = 'levels-completed';
const KEY_TEMP = 'temp';
const KEY_OTHER_DATA = 'other-data';

// Dev data key constants (best practice - use KEY_DEV_ prefix)
const KEY_DEV_AUTO_NAVIGATION = 'dev-auto-navigation';
const KEY_DEV_SKIP_ANIMATIONS = 'dev-skip-animations';
const KEY_DEV_MOCK_API = 'dev-mock-api';
const KEY_DEV_TEMP = 'dev-temp';

describe('PageMachine - Basic Tests', () => {
  it('should initialize with start path', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      routes: ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2']
    });

    expect(machine.current).toBe('/puzzle/intro');
    expect(machine.startPath).toBe('/puzzle/intro');
  });

  it('should throw error if startPath is missing', () => {
    expect(() => {
      new PageMachine({
        routes: ['/puzzle/intro']
      });
    }).toThrow('PageMachine requires startPath parameter');
  });

  it('should work without routes list', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro'
    });

    expect(machine.current).toBe('/puzzle/intro');
    expect(machine.routes).toEqual([]);
  });

  it('should initialize with initial data', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      routes: ['/puzzle/intro'],
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_COMPLETED]: false
      }
    });

    expect(machine.data.get(KEY_SCORE)).toBe(0);
    expect(machine.data.get(KEY_COMPLETED)).toBe(false);
  });

  it('should provide routes list', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });
    const routesCopy = machine.routes;

    expect(routesCopy).toEqual(routes);
    expect(routesCopy).not.toBe(routes); // Should be a copy
  });
});

describe('PageMachine - Route Synchronization', () => {
  it('should sync route from path with exact match', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    expect(machine.current).toBe('/puzzle/intro');

    const changed = machine.syncFromPath('/puzzle/level1');
    expect(changed).toBe(true);
    expect(machine.current).toBe('/puzzle/level1');
  });

  it('should sync route from path with partial match', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    // Path with query params or trailing content
    const changed = machine.syncFromPath('/puzzle/level1?some=param');
    expect(changed).toBe(true);
    expect(machine.current).toBe('/puzzle/level1');
  });

  it('should return false when path does not match any route', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    const changed = machine.syncFromPath('/other/path');
    expect(changed).toBe(false);
    expect(machine.current).toBe('/puzzle/intro'); // Should not change
  });

  it('should return false when syncing to current route', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    const changed = machine.syncFromPath('/puzzle/intro');
    expect(changed).toBe(false);
    expect(machine.current).toBe('/puzzle/intro');
  });

  it('should accept any path when routes list is empty', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    const changed = machine.syncFromPath('/any/arbitrary/path');
    expect(changed).toBe(true);
    expect(machine.current).toBe('/any/arbitrary/path');
  });
});

describe('PageMachine - Data Properties', () => {
  it('should set and get data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.data.set(KEY_SCORE, 100);
    expect(machine.data.get(KEY_SCORE)).toBe(100);

    machine.data.set(KEY_PLAYER_NAME, 'Alice');
    expect(machine.data.get(KEY_PLAYER_NAME)).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.data.update({
      [KEY_SCORE]: 100,
      [KEY_LEVEL]: 5,
      [KEY_COMPLETED]: true
    });

    expect(machine.data.get(KEY_SCORE)).toBe(100);
    expect(machine.data.get(KEY_LEVEL)).toBe(5);
    expect(machine.data.get(KEY_COMPLETED)).toBe(true);
  });

  it('should get all data properties', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_LEVEL]: 1
      }
    });

    machine.data.set(KEY_COMPLETED, false);

    const allData = machine.data.getAll();
    expect(allData).toEqual({
      [KEY_SCORE]: 0,
      [KEY_LEVEL]: 1,
      [KEY_COMPLETED]: false
    });
  });

  it('should throw error for uninitialized data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });
    const KEY_NONEXISTENT = 'nonexistent';

    expect(() => machine.data.get(KEY_NONEXISTENT)).toThrow(
      'Data key "nonexistent" is not initialized.'
    );
  });

  it('should throw error for data properties after deletion', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      initialData: { [KEY_TEMP]: 'value' }
    });

    machine.data.delete(KEY_TEMP);

    expect(() => machine.data.get(KEY_TEMP)).toThrow(
      'Data key "temp" is not initialized.'
    );
  });

  it('should delete data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.data.set(KEY_TEMP, 'value');
    expect(machine.data.has(KEY_TEMP)).toBe(true);

    const deleted = machine.data.delete(KEY_TEMP);
    expect(deleted).toBe(true);
    expect(machine.data.has(KEY_TEMP)).toBe(false);
  });

  it('should check if data properties exist', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    expect(machine.data.has(KEY_SCORE)).toBe(false);

    machine.data.set(KEY_SCORE, 100);
    expect(machine.data.has(KEY_SCORE)).toBe(true);
  });

  it('should clear all data properties', () => {
    const KEY_A = 'a';
    const KEY_B = 'b';
    const KEY_C = 'c';

    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      initialData: {
        [KEY_A]: 1,
        [KEY_B]: 2,
        [KEY_C]: 3
      }
    });

    expect(machine.data.size).toBe(3);

    machine.data.clear();
    expect(machine.data.size).toBe(0);
    expect(machine.data.has(KEY_A)).toBe(false);
  });

  it('should track data size', () => {
    const KEY_A = 'a';
    const KEY_B = 'b';
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    expect(machine.data.size).toBe(0);

    machine.data.set(KEY_A, 1);
    expect(machine.data.size).toBe(1);

    machine.data.set(KEY_B, 2);
    expect(machine.data.size).toBe(2);

    machine.data.delete(KEY_A);
    expect(machine.data.size).toBe(1);
  });
});

describe('PageMachine - Visited Routes', () => {
  it('should mark initial route as visited', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    expect(machine.hasVisited('/puzzle/intro')).toBe(true);
    expect(machine.hasVisited('/puzzle/level1')).toBe(false);
  });

  it('should track visited routes during sync', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    expect(machine.hasVisited('/puzzle/intro')).toBe(true);
    expect(machine.hasVisited('/puzzle/level1')).toBe(false);

    machine.syncFromPath('/puzzle/level1');
    expect(machine.hasVisited('/puzzle/level1')).toBe(true);

    machine.syncFromPath('/puzzle/level2');
    expect(machine.hasVisited('/puzzle/level2')).toBe(true);
  });

  it('should get all visited routes', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    machine.syncFromPath('/puzzle/level1');
    machine.syncFromPath('/puzzle/level2');

    const visited = machine.getVisitedRoutes();
    expect(visited).toContain('/puzzle/intro');
    expect(visited).toContain('/puzzle/level1');
    expect(visited).toContain('/puzzle/level2');
    expect(visited.length).toBe(3);
  });

  it('should reset visited routes', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    machine.syncFromPath('/puzzle/level1');
    machine.syncFromPath('/puzzle/level2');

    expect(machine.hasVisited('/puzzle/level1')).toBe(true);
    expect(machine.hasVisited('/puzzle/level2')).toBe(true);

    machine.resetVisitedRoutes();

    // After reset, only current route should be visited
    expect(machine.current).toBe('/puzzle/level2');
    expect(machine.hasVisited('/puzzle/level2')).toBe(true);
    expect(machine.hasVisited('/puzzle/level1')).toBe(false);
    expect(machine.hasVisited('/puzzle/intro')).toBe(false);
  });

  it('should check if start route has been visited', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    // Start route is always visited initially
    expect(machine.hasVisitedStart).toBe(true);

    // Navigate away from start
    machine.syncFromPath('/puzzle/level1');
    expect(machine.hasVisitedStart).toBe(true);

    // Reset and navigate away without returning to start
    machine.resetVisitedRoutes();
    expect(machine.current).toBe('/puzzle/level1');
    expect(machine.hasVisitedStart).toBe(false);

    // Navigate back to start
    machine.syncFromPath('/puzzle/intro');
    expect(machine.hasVisitedStart).toBe(true);
  });

  it('should track visited routes count', () => {
    const routes = ['/puzzle/intro', '/puzzle/level1', '/puzzle/level2'];
    const machine = new PageMachine({ startPath: '/puzzle/intro', routes });

    expect(machine.visitedRoutesCount).toBe(1);

    machine.syncFromPath('/puzzle/level1');
    expect(machine.visitedRoutesCount).toBe(2);

    machine.syncFromPath('/puzzle/level2');
    expect(machine.visitedRoutesCount).toBe(3);
  });
});

describe('PageMachine - Reactivity Tests', () => {
  it('should trigger effect when data changes (fine-grained)', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialData: { [KEY_SCORE]: 0 }
    });
    let effectRunCount = 0;
    let lastScoreValue = null;

    // Create effect watching SCORE
    const cleanup = $effect.root(() => {
      $effect(() => {
        lastScoreValue = machine.data.get(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change SCORE - should trigger effect
    machine.data.set(KEY_SCORE, 100);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastScoreValue).toBe(100);

    // Change SCORE again - should trigger effect again
    machine.data.set(KEY_SCORE, 200);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 2);
    expect(lastScoreValue).toBe(200);

    cleanup();
  });

  it('should NOT trigger effect when unrelated data changes', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialData: { [KEY_SCORE]: 0 }  // Initialize SCORE
    });
    let effectRunCount = 0;

    // Create effect watching only SCORE
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.data.get(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change OTHER_DATA - should NOT trigger effect
    machine.data.set(KEY_OTHER_DATA, 'value');
    flushSync();

    expect(effectRunCount).toBe(initialCount);

    cleanup();
  });

  it('should trigger effect when route changes', () => {
    const routes = ['/test/a', '/test/b', '/test/c'];
    const machine = new PageMachine({ startPath: '/test/a', routes });
    let effectRunCount = 0;
    let lastRoute = null;

    const cleanup = $effect.root(() => {
      $effect(() => {
        lastRoute = machine.current;
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change route - should trigger effect
    machine.syncFromPath('/test/b');
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastRoute).toBe('/test/b');

    cleanup();
  });

  it('should trigger effect when visited routes change', () => {
    const routes = ['/test/a', '/test/b'];
    const machine = new PageMachine({ startPath: '/test/a', routes });
    let effectRunCount = 0;
    let lastHasVisited = null;

    const cleanup = $effect.root(() => {
      $effect(() => {
        lastHasVisited = machine.hasVisited('/test/b');
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;
    expect(lastHasVisited).toBe(false);

    // Navigate to /test/b - should trigger effect
    machine.syncFromPath('/test/b');
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastHasVisited).toBe(true);

    cleanup();
  });

  it('should NOT trigger data effects when routes change', () => {
    const routes = ['/test/a', '/test/b'];
    const machine = new PageMachine({
      startPath: '/test/a',
      routes,
      initialData: { [KEY_SCORE]: 0 }
    });
    let dataEffectRunCount = 0;

    // Effect watching data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.data.get(KEY_SCORE);
        dataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = dataEffectRunCount;

    // Change route - should NOT trigger data effect
    machine.syncFromPath('/test/b');
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount);

    // Change data - SHOULD trigger effect
    machine.data.set(KEY_SCORE, 100);
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount + 1);

    cleanup();
  });

  it('should NOT trigger route effects when data changes', () => {
    const machine = new PageMachine({ startPath: '/test' });
    let routeEffectRunCount = 0;

    // Effect watching route only
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.hasVisited('/test');
        routeEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = routeEffectRunCount;

    // Change data - should NOT trigger route effect
    machine.data.set(KEY_SCORE, 100);
    flushSync();

    expect(routeEffectRunCount).toBe(initialCount);

    cleanup();
  });
});

describe('PageMachine - Extended Example', () => {
  it('should work in a puzzle game scenario', () => {
    const routes = [
      '/puzzle/welcome',
      '/puzzle/tutorial',
      '/puzzle/level1',
      '/puzzle/level2',
      '/puzzle/complete'
    ];

    const initialData = {
      [KEY_SCORE]: 0,
      [KEY_TUTORIAL_SEEN]: false,
      [KEY_LEVELS_COMPLETED]: []
    };

    const machine = new PageMachine({
      startPath: '/puzzle/welcome',
      routes,
      initialData
    });

    // User starts at welcome
    expect(machine.current).toBe('/puzzle/welcome');
    expect(machine.hasVisited('/puzzle/welcome')).toBe(true);

    // User goes to tutorial
    machine.syncFromPath('/puzzle/tutorial');
    expect(machine.current).toBe('/puzzle/tutorial');
    machine.data.set(KEY_TUTORIAL_SEEN, true);

    // User completes level 1
    machine.syncFromPath('/puzzle/level1');
    expect(machine.current).toBe('/puzzle/level1');
    machine.data.set(KEY_SCORE, 100);
    machine.data.update({
      [KEY_LEVELS_COMPLETED]: ['level1']
    });

    // User completes level 2
    machine.syncFromPath('/puzzle/level2');
    machine.data.update({
      [KEY_SCORE]: 250,
      [KEY_LEVELS_COMPLETED]: ['level1', 'level2']
    });

    // Check final state
    expect(machine.current).toBe('/puzzle/level2');
    expect(machine.data.get(KEY_SCORE)).toBe(250);
    expect(machine.data.get(KEY_TUTORIAL_SEEN)).toBe(true);
    expect(machine.data.get(KEY_LEVELS_COMPLETED)).toEqual([
      'level1',
      'level2'
    ]);

    // Check visited routes
    expect(machine.hasVisited('/puzzle/welcome')).toBe(true);
    expect(machine.hasVisited('/puzzle/tutorial')).toBe(true);
    expect(machine.hasVisited('/puzzle/level1')).toBe(true);
    expect(machine.hasVisited('/puzzle/level2')).toBe(true);
    expect(machine.hasVisited('/puzzle/complete')).toBe(false);
  });
});

describe('PageMachine - Start Path Methods', () => {
  it('should return start path', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routes: ['/game/intro', '/game/play']
    });

    expect(machine.startPath).toBe('/game/intro');
  });

  it('should check if path is start path', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routes: ['/game/intro', '/game/play']
    });

    expect(machine.isStartPath('/game/intro')).toBe(true);
    expect(machine.isStartPath('/game/play')).toBe(false);
    expect(machine.isStartPath('/other')).toBe(false);
  });

  it('should check if on start path', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routes: ['/game/intro', '/game/play']
    });

    expect(machine.isOnStartPath).toBe(true);

    machine.syncFromPath('/game/play');
    expect(machine.isOnStartPath).toBe(false);

    machine.syncFromPath('/game/intro');
    expect(machine.isOnStartPath).toBe(true);
  });

  it('should redirect to start path', async () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routes: ['/game/intro', '/game/play']
    });

    machine.redirectToStartPath();

    // Wait for dynamic import to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(machine.startPath).toBe('/game/intro');
  });
});

describe('PageMachine - Dev Data Properties', () => {
  it('should set and get dev data properties (dynamic creation)', () => {
    const machine = new PageMachine({ startPath: '/test' });

    // setDevData can create new keys dynamically
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(true);

    machine.devData.set(KEY_DEV_SKIP_ANIMATIONS, false);
    expect(machine.devData.get(KEY_DEV_SKIP_ANIMATIONS)).toBe(false);

    machine.devData.set(KEY_DEV_MOCK_API, 'http://localhost:3000');
    expect(machine.devData.get(KEY_DEV_MOCK_API)).toBe('http://localhost:3000');
  });

  it('should update multiple dev data properties', () => {
    const machine = new PageMachine({ startPath: '/test' });

    machine.devData.update({
      [KEY_DEV_AUTO_NAVIGATION]: true,
      [KEY_DEV_SKIP_ANIMATIONS]: false,
      [KEY_DEV_MOCK_API]: 'localhost'
    });

    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(true);
    expect(machine.devData.get(KEY_DEV_SKIP_ANIMATIONS)).toBe(false);
    expect(machine.devData.get(KEY_DEV_MOCK_API)).toBe('localhost');
  });

  it('should get all dev data properties', () => {
    const machine = new PageMachine({ startPath: '/test' });

    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    machine.devData.set(KEY_DEV_SKIP_ANIMATIONS, false);

    const allDevData = machine.devData.getAll();
    expect(allDevData).toEqual({
      [KEY_DEV_AUTO_NAVIGATION]: true,
      [KEY_DEV_SKIP_ANIMATIONS]: false
    });
  });

  it('should throw error for uninitialized dev data properties', () => {
    const machine = new PageMachine({ startPath: '/test' });
    const KEY_DEV_NONEXISTENT = 'dev-nonexistent';

    expect(() => machine.devData.get(KEY_DEV_NONEXISTENT)).toThrow(
      'Dev data key "dev-nonexistent" is not initialized.'
    );
  });

  it('should throw error for dev data properties after deletion', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: { [KEY_DEV_TEMP]: 'value' }
    });

    machine.devData.delete(KEY_DEV_TEMP);

    expect(() => machine.devData.get(KEY_DEV_TEMP)).toThrow(
      'Dev data key "dev-temp" is not initialized.'
    );
  });

  it('should initialize dev data from initialDevData parameter', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: {
        [KEY_DEV_AUTO_NAVIGATION]: false,
        [KEY_DEV_SKIP_ANIMATIONS]: true,
        [KEY_DEV_MOCK_API]: 'localhost'
      }
    });

    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(false);
    expect(machine.devData.get(KEY_DEV_SKIP_ANIMATIONS)).toBe(true);
    expect(machine.devData.get(KEY_DEV_MOCK_API)).toBe('localhost');
    expect(machine.devData.size).toBe(3);
  });

  it('should delete dev data properties', () => {
    const machine = new PageMachine({ startPath: '/test' });

    machine.devData.set(KEY_DEV_TEMP, 'value');
    expect(machine.devData.has(KEY_DEV_TEMP)).toBe(true);

    const deleted = machine.devData.delete(KEY_DEV_TEMP);
    expect(deleted).toBe(true);
    expect(machine.devData.has(KEY_DEV_TEMP)).toBe(false);
  });

  it('should check if dev data properties exist', () => {
    const machine = new PageMachine({ startPath: '/test' });

    expect(machine.devData.has(KEY_DEV_AUTO_NAVIGATION)).toBe(false);

    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    expect(machine.devData.has(KEY_DEV_AUTO_NAVIGATION)).toBe(true);
  });

  it('should clear all dev data properties', () => {
    const KEY_DEV_A = 'dev-a';
    const KEY_DEV_B = 'dev-b';
    const KEY_DEV_C = 'dev-c';

    const machine = new PageMachine({ startPath: '/test' });

    machine.devData.set(KEY_DEV_A, 1);
    machine.devData.set(KEY_DEV_B, 2);
    machine.devData.set(KEY_DEV_C, 3);

    expect(machine.devData.size).toBe(3);

    machine.devData.clear();
    expect(machine.devData.size).toBe(0);
    expect(machine.devData.has(KEY_DEV_A)).toBe(false);
  });

  it('should track dev data size', () => {
    const KEY_DEV_A = 'dev-a';
    const KEY_DEV_B = 'dev-b';
    const machine = new PageMachine({ startPath: '/test' });

    expect(machine.devData.size).toBe(0);

    machine.devData.set(KEY_DEV_A, 1);
    expect(machine.devData.size).toBe(1);

    machine.devData.set(KEY_DEV_B, 2);
    expect(machine.devData.size).toBe(2);

    machine.devData.delete(KEY_DEV_A);
    expect(machine.devData.size).toBe(1);
  });

  it('should keep dev data separate from regular data', () => {
    const machine = new PageMachine({ startPath: '/test' });

    // Set regular data
    machine.data.set(KEY_SCORE, 100);

    // Set dev data with similar-looking key
    machine.devData.set('score', 999);

    // Regular data should be unaffected
    expect(machine.data.get(KEY_SCORE)).toBe(100);
    expect(machine.devData.get('score')).toBe(999);

    // Sizes should be independent
    expect(machine.data.size).toBe(1);
    expect(machine.devData.size).toBe(1);
  });
});

describe('PageMachine - Dev Data Reactivity', () => {
  it('should trigger effect when dev data changes', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: { [KEY_DEV_AUTO_NAVIGATION]: false }
    });
    let effectRunCount = 0;
    let lastValue = null;

    const cleanup = $effect.root(() => {
      $effect(() => {
        lastValue = machine.devData.get(KEY_DEV_AUTO_NAVIGATION);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change dev data - should trigger effect
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastValue).toBe(true);

    // Change dev data again - should trigger effect again
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, false);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 2);
    expect(lastValue).toBe(false);

    cleanup();
  });

  it('should NOT trigger effect when unrelated dev data changes', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: {
        [KEY_DEV_AUTO_NAVIGATION]: false,
        [KEY_DEV_SKIP_ANIMATIONS]: false
      }
    });
    let effectRunCount = 0;

    // Create effect watching only AUTO_NAVIGATION
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.devData.get(KEY_DEV_AUTO_NAVIGATION);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change SKIP_ANIMATIONS - should NOT trigger effect
    machine.devData.set(KEY_DEV_SKIP_ANIMATIONS, true);
    flushSync();

    expect(effectRunCount).toBe(initialCount);

    cleanup();
  });

  it('should NOT trigger regular data effects when dev data changes', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialData: { [KEY_SCORE]: 0 },
      initialDevData: { [KEY_DEV_AUTO_NAVIGATION]: false }
    });
    let dataEffectRunCount = 0;

    // Effect watching regular data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.data.get(KEY_SCORE);
        dataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = dataEffectRunCount;

    // Change dev data - should NOT trigger regular data effect
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount);

    // Change regular data - SHOULD trigger effect
    machine.data.set(KEY_SCORE, 100);
    flushSync();

    expect(dataEffectRunCount).toBe(initialCount + 1);

    cleanup();
  });

  it('should NOT trigger dev data effects when regular data changes', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: { [KEY_DEV_AUTO_NAVIGATION]: false }
    });
    let devDataEffectRunCount = 0;

    // Effect watching dev data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.devData.get(KEY_DEV_AUTO_NAVIGATION);
        devDataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = devDataEffectRunCount;

    // Change regular data - should NOT trigger dev data effect
    machine.data.set(KEY_SCORE, 100);
    flushSync();

    expect(devDataEffectRunCount).toBe(initialCount);

    cleanup();
  });

  it('should NOT trigger dev data effects when routes change', () => {
    const routes = ['/test/a', '/test/b'];
    const machine = new PageMachine({
      startPath: '/test/a',
      routes,
      initialDevData: { [KEY_DEV_AUTO_NAVIGATION]: false }
    });
    let devDataEffectRunCount = 0;

    // Effect watching dev data only
    const cleanup = $effect.root(() => {
      $effect(() => {
        machine.devData.get(KEY_DEV_AUTO_NAVIGATION);
        devDataEffectRunCount++;
      });
    });

    flushSync();
    const initialCount = devDataEffectRunCount;

    // Change route - should NOT trigger dev data effect
    machine.syncFromPath('/test/b');
    flushSync();

    expect(devDataEffectRunCount).toBe(initialCount);

    cleanup();
  });
});

describe('PageMachine - Dev Data Integration', () => {
  it('should work with both regular and dev data independently', () => {
    const machine = new PageMachine({
      startPath: '/test',
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_LEVEL]: 1
      },
      initialDevData: {
        [KEY_DEV_AUTO_NAVIGATION]: true,
        [KEY_DEV_SKIP_ANIMATIONS]: false
      }
    });

    // Set regular data
    machine.data.set(KEY_SCORE, 100);
    machine.data.set(KEY_LEVEL, 5);

    // Set dev data
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, false);
    machine.devData.set(KEY_DEV_SKIP_ANIMATIONS, true);

    // Verify regular data
    expect(machine.data.get(KEY_SCORE)).toBe(100);
    expect(machine.data.get(KEY_LEVEL)).toBe(5);
    expect(machine.data.size).toBe(2);

    // Verify dev data
    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(false);
    expect(machine.devData.get(KEY_DEV_SKIP_ANIMATIONS)).toBe(true);
    expect(machine.devData.size).toBe(2);

    // Clear dev data shouldn't affect regular data
    machine.devData.clear();
    expect(machine.data.get(KEY_SCORE)).toBe(100);
    expect(machine.data.get(KEY_LEVEL)).toBe(5);
    expect(machine.data.size).toBe(2);
    expect(machine.devData.size).toBe(0);

    // Clear regular data shouldn't affect dev data
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, true);
    machine.data.clear();
    expect(machine.data.size).toBe(0);
    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(true);
    expect(machine.devData.size).toBe(1);
  });

  it('should handle complex dev data values', () => {
    const KEY_DEV_DEBUG_FLAGS = 'dev-debug-flags';
    const KEY_DEV_NULL_VALUE = 'dev-null-value';

    const machine = new PageMachine({
      startPath: '/test',
      initialDevData: {
        [KEY_DEV_MOCK_API]: { url: 'initial', port: 0 },
        [KEY_DEV_DEBUG_FLAGS]: [],
        [KEY_DEV_AUTO_NAVIGATION]: true,
        [KEY_DEV_NULL_VALUE]: null
      }
    });

    // Object value
    const mockConfig = { url: 'localhost', port: 3000 };
    machine.devData.set(KEY_DEV_MOCK_API, mockConfig);
    expect(machine.devData.get(KEY_DEV_MOCK_API)).toEqual(mockConfig);

    // Array value
    const debugFlags = ['verbose', 'trace', 'profile'];
    machine.devData.set(KEY_DEV_DEBUG_FLAGS, debugFlags);
    expect(machine.devData.get(KEY_DEV_DEBUG_FLAGS)).toEqual(debugFlags);

    // Boolean value
    machine.devData.set(KEY_DEV_AUTO_NAVIGATION, false);
    expect(machine.devData.get(KEY_DEV_AUTO_NAVIGATION)).toBe(false);

    // Null value
    machine.devData.set(KEY_DEV_NULL_VALUE, null);
    expect(machine.devData.get(KEY_DEV_NULL_VALUE)).toBe(null);
  });
});
