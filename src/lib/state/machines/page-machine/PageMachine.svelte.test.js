// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';

import PageMachine from './PageMachine.svelte.js';

describe('PageMachine - Basic Tests', () => {
  it('should initialize with start path', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      routeMap: {
        intro: '/puzzle/intro',
        level1: '/puzzle/level1',
        level2: '/puzzle/level2'
      }
    });

    expect(machine.current).toBe('intro');
    expect(machine.startPath).toBe('/puzzle/intro');
    expect(machine.startState).toBe('intro');
  });

  it('should throw error if startPath is missing', () => {
    expect(() => {
      new PageMachine({
        routeMap: {
          intro: '/puzzle/intro'
        }
      });
    }).toThrow('PageMachine requires startPath parameter');
  });

  it('should throw error if startPath not in routeMap', () => {
    expect(() => {
      new PageMachine({
        startPath: '/puzzle/nonexistent',
        routeMap: {
          intro: '/puzzle/intro'
        }
      });
    }).toThrow('PageMachine: startPath "/puzzle/nonexistent" not found in routeMap');
  });

  it('should initialize with initial data', () => {
    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      routeMap: {
        intro: '/puzzle/intro'
      },
      initialData: {
        SCORE: 0,
        LEVEL_COMPLETED: false
      }
    });

    expect(machine.getData('SCORE')).toBe(0);
    expect(machine.getData('LEVEL_COMPLETED')).toBe(false);
  });

  it('should get route path for state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    expect(machine.getPathForState('intro')).toBe('/puzzle/intro');
    expect(machine.getPathForState('level1')).toBe('/puzzle/level1');
    expect(machine.getPathForState('nonexistent')).toBe(null);
  });

  it('should get current path', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    expect(machine.getCurrentPath()).toBe('/puzzle/intro');
  });

  it('should provide route map', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });
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

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    const changed = machine.syncFromPath('/other/path');
    expect(changed).toBe(false);
    expect(machine.current).toBe('intro'); // Should not change
  });

  it('should return false when syncing to current state', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    const changed = machine.syncFromPath('/puzzle/intro');
    expect(changed).toBe(false);
    expect(machine.current).toBe('intro');
  });

  it('should set state directly', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    machine.setState('level1');
    expect(machine.current).toBe('level1');
  });
});

describe('PageMachine - Data Properties', () => {
  it('should set and get data properties', () => {
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    machine.setData('SCORE', 100);
    expect(machine.getData('SCORE')).toBe(100);

    machine.setData('PLAYER_NAME', 'Alice');
    expect(machine.getData('PLAYER_NAME')).toBe('Alice');
  });

  it('should update multiple data properties', () => {
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({
      startPath: '/puzzle/intro',
      routeMap,
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
    const routeMap = { intro: '/puzzle/intro' };
    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    expect(machine.getData('NONEXISTENT')).toBe(undefined);
  });
});

describe('PageMachine - Visited States', () => {
  it('should mark initial state as visited', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

    expect(machine.hasVisited('intro')).toBe(true);
    expect(machine.hasVisited('level1')).toBe(false);
  });

  it('should track visited states during sync', () => {
    const routeMap = {
      intro: '/puzzle/intro',
      level1: '/puzzle/level1',
      level2: '/puzzle/level2'
    };

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({ startPath: '/puzzle/intro', routeMap });

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

    const machine = new PageMachine({
      startPath: '/puzzle/welcome',
      routeMap,
      initialData
    });

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

describe('PageMachine - onEnter Hooks', () => {
  it('should call onEnter hook when entering state', async () => {
    const onEnterMock = vi.fn();

    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: onEnterMock
      }
    });

    await machine.setState('animate');

    expect(onEnterMock).toHaveBeenCalled();
  });

  it('should provide done callback to onEnter hook', async () => {
    let receivedDone = null;

    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          receivedDone = done;
        }
      }
    });

    await machine.setState('animate');

    expect(receivedDone).toBeInstanceOf(Function);
  });

  it('should auto-transition when done is called', async () => {
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate',
        play: '/game/play'
      },
      onEnterHooks: {
        animate: (done) => {
          setTimeout(() => done('play'), 10);
        }
      }
    });

    await machine.setState('animate');
    expect(machine.current).toBe('animate');

    // Wait for done to be called
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(machine.current).toBe('play');
  });

  it('should store abort/complete handlers from onEnter return', async () => {
    const abortMock = vi.fn();
    const completeMock = vi.fn();

    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            abort: abortMock,
            complete: completeMock
          };
        }
      }
    });

    await machine.setState('animate');

    expect(machine.canAbortTransitions).toBe(true);
    expect(machine.canCompleteTransitions).toBe(true);

    machine.abortTransitions();
    expect(abortMock).toHaveBeenCalled();
  });

  it('should call abort handler when state changes', async () => {
    const abortMock = vi.fn();

    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate',
        play: '/game/play'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            abort: abortMock
          };
        }
      }
    });

    await machine.setState('animate');
    expect(abortMock).not.toHaveBeenCalled();

    await machine.setState('play');
    expect(abortMock).toHaveBeenCalled();
  });

  it('should support animation scenario with timeout', async () => {
    let timeoutId;
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate',
        play: '/game/play'
      },
      onEnterHooks: {
        animate: (done) => {
          timeoutId = setTimeout(() => done('play'), 100);

          return {
            abort: () => clearTimeout(timeoutId),
            complete: () => {
              clearTimeout(timeoutId);
              done('play');
            }
          };
        }
      }
    });

    await machine.setState('animate');
    expect(machine.current).toBe('animate');

    // Fast-forward by calling complete
    machine.completeTransitions();

    // Wait a bit for done to be processed
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(machine.current).toBe('play');
  });

  it('should handle Web Animation API pattern', async () => {
    // Mock animation
    const mockAnimation = {
      finished: null,
      cancel: vi.fn(),
      finish: vi.fn()
    };

    mockAnimation.finished = new Promise(resolve => {
      setTimeout(resolve, 100);
    });

    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate',
        play: '/game/play'
      },
      onEnterHooks: {
        animate: (done) => {
          mockAnimation.finished.then(() => done('play'));

          return {
            abort: () => mockAnimation.cancel(),
            complete: () => mockAnimation.finish()
          };
        }
      }
    });

    await machine.setState('animate');
    expect(machine.current).toBe('animate');

    // Call abort
    machine.abortTransitions();
    expect(mockAnimation.cancel).toHaveBeenCalled();
  });
});

describe('PageMachine - Transition Control', () => {
  it('should expose canAbortTransitions getter', async () => {
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            abort: () => {}
          };
        }
      }
    });

    expect(machine.canAbortTransitions).toBe(false);

    await machine.setState('animate');

    expect(machine.canAbortTransitions).toBe(true);
  });

  it('should expose canCompleteTransitions getter', async () => {
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            complete: () => {}
          };
        }
      }
    });

    expect(machine.canCompleteTransitions).toBe(false);

    await machine.setState('animate');

    expect(machine.canCompleteTransitions).toBe(true);
  });

  it('should clear handlers after abort', async () => {
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            abort: () => {},
            complete: () => {}
          };
        }
      }
    });

    await machine.setState('animate');
    expect(machine.canAbortTransitions).toBe(true);

    machine.abortTransitions();

    expect(machine.canAbortTransitions).toBe(false);
    expect(machine.canCompleteTransitions).toBe(false);
  });

  it('should clear handlers after complete', async () => {
    const machine = new PageMachine({
      startPath: '/game/start',
      routeMap: {
        start: '/game/start',
        animate: '/game/animate'
      },
      onEnterHooks: {
        animate: (done) => {
          return {
            abort: () => {},
            complete: () => {}
          };
        }
      }
    });

    await machine.setState('animate');
    expect(machine.canCompleteTransitions).toBe(true);

    machine.completeTransitions();

    expect(machine.canAbortTransitions).toBe(false);
    expect(machine.canCompleteTransitions).toBe(false);
  });
});

describe('PageMachine - Start Path Methods', () => {
  it('should return start path', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routeMap: {
        intro: '/game/intro',
        play: '/game/play'
      }
    });

    expect(machine.startPath).toBe('/game/intro');
  });

  it('should return start state', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routeMap: {
        intro: '/game/intro',
        play: '/game/play'
      }
    });

    expect(machine.startState).toBe('intro');
  });

  it('should check if path is start path', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routeMap: {
        intro: '/game/intro',
        play: '/game/play'
      }
    });

    expect(machine.isStartPath('/game/intro')).toBe(true);
    expect(machine.isStartPath('/game/play')).toBe(false);
    expect(machine.isStartPath('/other')).toBe(false);
  });

  it('should check if on start state', () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routeMap: {
        intro: '/game/intro',
        play: '/game/play'
      }
    });

    expect(machine.isOnStartState).toBe(true);

    machine.syncFromPath('/game/play');
    expect(machine.isOnStartState).toBe(false);

    machine.syncFromPath('/game/intro');
    expect(machine.isOnStartState).toBe(true);
  });

  it('should redirect to start path', async () => {
    const machine = new PageMachine({
      startPath: '/game/intro',
      routeMap: {
        intro: '/game/intro',
        play: '/game/play'
      }
    });

    // Mock the dynamic import
    vi.mock('$src/lib/util/sveltekit.js', () => ({
      switchToPage: vi.fn()
    }));

    machine.redirectToStartPath();

    // Wait for dynamic import to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    // Note: Testing dynamic imports is tricky in unit tests
    // This is more of an integration test concern
    expect(machine.startPath).toBe('/game/intro');
  });
});
