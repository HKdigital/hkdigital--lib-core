// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
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

    expect(machine.getData(KEY_SCORE)).toBe(0);
    expect(machine.getData(KEY_COMPLETED)).toBe(false);
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

    machine.setData(KEY_SCORE, 100);
    expect(machine.getData(KEY_SCORE)).toBe(100);

    machine.setData(KEY_PLAYER_NAME, 'Alice');
    expect(machine.getData(KEY_PLAYER_NAME)).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.updateData({
      [KEY_SCORE]: 100,
      [KEY_LEVEL]: 5,
      [KEY_COMPLETED]: true
    });

    expect(machine.getData(KEY_SCORE)).toBe(100);
    expect(machine.getData(KEY_LEVEL)).toBe(5);
    expect(machine.getData(KEY_COMPLETED)).toBe(true);
  });

  it('should get all data properties', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      initialData: {
        [KEY_SCORE]: 0,
        [KEY_LEVEL]: 1
      }
    });

    machine.setData(KEY_COMPLETED, false);

    const allData = machine.getAllData();
    expect(allData).toEqual({
      [KEY_SCORE]: 0,
      [KEY_LEVEL]: 1,
      [KEY_COMPLETED]: false
    });
  });

  it('should return undefined for nonexistent data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });
    const KEY_NONEXISTENT = 'nonexistent';
    expect(machine.getData(KEY_NONEXISTENT)).toBe(undefined);
  });

  it('should delete data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.setData(KEY_TEMP, 'value');
    expect(machine.hasData(KEY_TEMP)).toBe(true);

    const deleted = machine.deleteData(KEY_TEMP);
    expect(deleted).toBe(true);
    expect(machine.hasData(KEY_TEMP)).toBe(false);
  });

  it('should check if data properties exist', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    expect(machine.hasData(KEY_SCORE)).toBe(false);

    machine.setData(KEY_SCORE, 100);
    expect(machine.hasData(KEY_SCORE)).toBe(true);
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

    expect(machine.dataSize).toBe(3);

    machine.clearData();
    expect(machine.dataSize).toBe(0);
    expect(machine.hasData(KEY_A)).toBe(false);
  });

  it('should track data size', () => {
    const KEY_A = 'a';
    const KEY_B = 'b';
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    expect(machine.dataSize).toBe(0);

    machine.setData(KEY_A, 1);
    expect(machine.dataSize).toBe(1);

    machine.setData(KEY_B, 2);
    expect(machine.dataSize).toBe(2);

    machine.deleteData(KEY_A);
    expect(machine.dataSize).toBe(1);
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
    const machine = new PageMachine({ startPath: '/test' });
    let effectRunCount = 0;
    let lastScoreValue = null;

    // Create effect watching SCORE
    const cleanup = $effect.root(() => {
      $effect(() => {
        lastScoreValue = machine.getData(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change SCORE - should trigger effect
    machine.setData(KEY_SCORE, 100);
    flushSync();

    expect(effectRunCount).toBe(initialCount + 1);
    expect(lastScoreValue).toBe(100);

    // Change SCORE again - should trigger effect again
    machine.setData(KEY_SCORE, 200);
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
        machine.getData(KEY_SCORE);
        effectRunCount++;
      });
    });

    flushSync();
    const initialCount = effectRunCount;

    // Change OTHER_DATA - should NOT trigger effect
    machine.setData(KEY_OTHER_DATA, 'value');
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
        machine.getData(KEY_SCORE);
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
    machine.setData(KEY_SCORE, 100);
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
    machine.setData(KEY_SCORE, 100);
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
    machine.setData(KEY_TUTORIAL_SEEN, true);

    // User completes level 1
    machine.syncFromPath('/puzzle/level1');
    expect(machine.current).toBe('/puzzle/level1');
    machine.setData(KEY_SCORE, 100);
    machine.updateData({
      [KEY_LEVELS_COMPLETED]: ['level1']
    });

    // User completes level 2
    machine.syncFromPath('/puzzle/level2');
    machine.updateData({
      [KEY_SCORE]: 250,
      [KEY_LEVELS_COMPLETED]: ['level1', 'level2']
    });

    // Check final state
    expect(machine.current).toBe('/puzzle/level2');
    expect(machine.getData(KEY_SCORE)).toBe(250);
    expect(machine.getData(KEY_TUTORIAL_SEEN)).toBe(true);
    expect(machine.getData(KEY_LEVELS_COMPLETED)).toEqual([
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
