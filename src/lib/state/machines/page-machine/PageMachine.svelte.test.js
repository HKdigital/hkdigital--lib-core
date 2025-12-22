// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

import PageMachine from './PageMachine.svelte.js';

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
        SCORE: 0,
        LEVEL_COMPLETED: false
      }
    });

    expect(machine.getData('SCORE')).toBe(0);
    expect(machine.getData('LEVEL_COMPLETED')).toBe(false);
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

    machine.setData('SCORE', 100);
    expect(machine.getData('SCORE')).toBe(100);

    machine.setData('PLAYER_NAME', 'Alice');
    expect(machine.getData('PLAYER_NAME')).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });

    machine.updateData({
      SCORE: 100,
      LEVEL: 5,
      COMPLETED: true
    });

    expect(machine.getData('SCORE')).toBe(100);
    expect(machine.getData('LEVEL')).toBe(5);
    expect(machine.getData('COMPLETED')).toBe(true);
  });

  it('should get all data properties', () => {
    const initialData = {
      SCORE: 0,
      LEVEL: 1
    };

    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      initialData
    });

    machine.setData('COMPLETED', false);

    const allData = machine.getAllData();
    expect(allData).toEqual({
      SCORE: 0,
      LEVEL: 1,
      COMPLETED: false
    });
  });

  it('should return undefined for nonexistent data properties', () => {
    const machine = new PageMachine({ startPath: '/puzzle/intro' });
    expect(machine.getData('NONEXISTENT')).toBe(undefined);
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
      SCORE: 0,
      TUTORIAL_SEEN: false,
      LEVELS_COMPLETED: []
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
    machine.setData('TUTORIAL_SEEN', true);

    // User completes level 1
    machine.syncFromPath('/puzzle/level1');
    expect(machine.current).toBe('/puzzle/level1');
    machine.setData('SCORE', 100);
    machine.updateData({
      LEVELS_COMPLETED: ['level1']
    });

    // User completes level 2
    machine.syncFromPath('/puzzle/level2');
    machine.updateData({
      SCORE: 250,
      LEVELS_COMPLETED: ['level1', 'level2']
    });

    // Check final state
    expect(machine.current).toBe('/puzzle/level2');
    expect(machine.getData('SCORE')).toBe(250);
    expect(machine.getData('TUTORIAL_SEEN')).toBe(true);
    expect(machine.getData('LEVELS_COMPLETED')).toEqual([
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
