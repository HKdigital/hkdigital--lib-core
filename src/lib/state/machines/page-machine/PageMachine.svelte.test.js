// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

import PageMachine from './PageMachine.svelte.js';

describe('PageMachine - Basic Tests', () => {
  it('should initialize with initial state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.current).toBe('intro');
  });

  it('should initialize with initial data', () => {
    const routeMap = {
      intro: '/puzzle/intro'
    };

    const initialData = {
      SCORE: 0,
      LEVEL_COMPLETED: false
    };

    const machine = new PageMachine('intro', routeMap, initialData);

    expect(machine.getData('SCORE')).toBe(0);
    expect(machine.getData('LEVEL_COMPLETED')).toBe(false);
  });

  it('should get route path for state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.getPathForState('intro')).toBe('/puzzle/intro');
    expect(machine.getPathForState('level1')).toBe('/puzzle/level1');
    expect(machine.getPathForState('nonexistent')).toBe(null);
  });

  it('should get current path', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.getCurrentPath()).toBe('/puzzle/intro');
  });

  it('should provide route map', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);
    const map = machine.routeMap;

    expect(map).toEqual(routeMap);
    expect(map).not.toBe(routeMap); // Should be a copy
  });
});

describe('PageMachine - State Synchronization', () => {
  it('should sync state from path with exact match', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.current).toBe('intro');

    const changed = machine.syncFromPath('/puzzle/level1');
    expect(changed).toBe(true);
    expect(machine.current).toBe('level1');
  });

  it('should sync state from path with partial match', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    // Path with query params or trailing content
    const changed = machine.syncFromPath('/puzzle/level1?some=param');
    expect(changed).toBe(true);
    expect(machine.current).toBe('level1');
  });

  it('should return false when path does not match any state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    const changed = machine.syncFromPath('/other/path');
    expect(changed).toBe(false);
    expect(machine.current).toBe('intro'); // Should not change
  });

  it('should return false when syncing to current state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    const changed = machine.syncFromPath('/puzzle/intro');
    expect(changed).toBe(false);
    expect(machine.current).toBe('intro');
  });

  it('should set state directly', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    machine.setState('level1');
    expect(machine.current).toBe('level1');
  });
});

describe('PageMachine - Data Properties', () => {
  it('should set and get data properties', () => {
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine('intro', routeMap);

    machine.setData('SCORE', 100);
    expect(machine.getData('SCORE')).toBe(100);

    machine.setData('PLAYER_NAME', 'Alice');
    expect(machine.getData('PLAYER_NAME')).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine('intro', routeMap);

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
    const routeMap = { intro: '/puzzle/intro' };
    const initialData = {
      SCORE: 0,
      LEVEL: 1
    };

    const machine = new PageMachine('intro', routeMap, initialData);

    machine.setData('COMPLETED', false);

    const allData = machine.getAllData();
    expect(allData).toEqual({
      SCORE: 0,
      LEVEL: 1,
      COMPLETED: false
    });
  });

  it('should return undefined for nonexistent data properties', () => {
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine('intro', routeMap);

    expect(machine.getData('NONEXISTENT')).toBe(undefined);
  });
});

describe('PageMachine - Visited States', () => {
  it('should mark initial state as visited', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.hasVisited('intro')).toBe(true);
    expect(machine.hasVisited('level1')).toBe(false);
  });

  it('should track visited states during sync', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine('intro', routeMap);

    expect(machine.hasVisited('intro')).toBe(true);
    expect(machine.hasVisited('level1')).toBe(false);

    machine.syncFromPath('/puzzle/level1');
    expect(machine.hasVisited('level1')).toBe(true);

    machine.syncFromPath('/puzzle/level2');
    expect(machine.hasVisited('level2')).toBe(true);
  });

  it('should get all visited states', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine('intro', routeMap);

    machine.syncFromPath('/puzzle/level1');
    machine.syncFromPath('/puzzle/level2');

    const visited = machine.getVisitedStates();
    expect(visited).toContain('intro');
    expect(visited).toContain('level1');
    expect(visited).toContain('level2');
    expect(visited.length).toBe(3);
  });

  it('should reset visited states', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine('intro', routeMap);

    machine.syncFromPath('/puzzle/level1');
    machine.syncFromPath('/puzzle/level2');

    expect(machine.hasVisited('level1')).toBe(true);
    expect(machine.hasVisited('level2')).toBe(true);

    machine.resetVisitedStates();

    // After reset, only current state should be visited
    expect(machine.current).toBe('level2');
    expect(machine.hasVisited('level2')).toBe(true);
    expect(machine.hasVisited('level1')).toBe(false);
    expect(machine.hasVisited('intro')).toBe(false);
  });
});

describe('PageMachine - Extended Example', () => {
  it('should work in a puzzle game scenario', () => {
    const routeMap = {
      welcome: '/puzzle/welcome',
      tutorial: '/puzzle/tutorial',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2',
      complete: '/puzzle/complete'
    };

    const initialData = {
      SCORE: 0,
      TUTORIAL_SEEN: false,
      LEVELS_COMPLETED: []
    };

    const machine = new PageMachine('welcome', routeMap, initialData);

    // User starts at welcome
    expect(machine.current).toBe('welcome');
    expect(machine.hasVisited('welcome')).toBe(true);

    // User goes to tutorial
    machine.syncFromPath('/puzzle/tutorial');
    expect(machine.current).toBe('tutorial');
    machine.setData('TUTORIAL_SEEN', true);

    // User completes level 1
    machine.syncFromPath('/puzzle/level1');
    expect(machine.current).toBe('level1');
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
    expect(machine.current).toBe('level2');
    expect(machine.getData('SCORE')).toBe(250);
    expect(machine.getData('TUTORIAL_SEEN')).toBe(true);
    expect(machine.getData('LEVELS_COMPLETED')).toEqual([
      'level1',
      'level2'
    ]);

    // Check visited states
    expect(machine.hasVisited('welcome')).toBe(true);
    expect(machine.hasVisited('tutorial')).toBe(true);
    expect(machine.hasVisited('level1')).toBe(true);
    expect(machine.hasVisited('level2')).toBe(true);
    expect(machine.hasVisited('complete')).toBe(false);
  });
});
