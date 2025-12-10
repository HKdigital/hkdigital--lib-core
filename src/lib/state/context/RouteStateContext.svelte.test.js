// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

import { goto } from '$app/navigation';
import RouteStateContext from './RouteStateContext.svelte.js';

describe('RouteStateContext - Constructor', () => {
  it('should require startPath parameter', () => {
    expect(() => {
      // @ts-ignore - testing invalid constructor call
      new RouteStateContext({});
    }).toThrow('RouteStateContext requires startPath parameter');
  });

  it('should initialize with startPath', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle'
    });

    // Should not throw, basic initialization works
    expect(context).toBeDefined();
  });

  it('should initialize with enforceStartPath option', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    expect(context).toBeDefined();
  });

  it('should default enforceStartPath to false', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle'
    });

    // validateAndRedirect should not redirect when enforcement is off
    context.validateAndRedirect('/puzzle/level1');
    expect(goto).not.toHaveBeenCalled();
  });
});

describe('RouteStateContext - validateAndRedirect without enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not redirect when enforceStartPath is false', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: false
    });

    context.validateAndRedirect('/puzzle/level1');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzle/level2');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect for any path when enforcement is off', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle'
    });

    context.validateAndRedirect('/puzzle');
    context.validateAndRedirect('/puzzle/intro');
    context.validateAndRedirect('/puzzle/level1/sublevel');
    context.validateAndRedirect('/other/path');

    expect(goto).not.toHaveBeenCalled();
  });
});

describe('RouteStateContext - validateAndRedirect with enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not redirect when on start path', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should redirect subroutes to start path if not visited', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    context.validateAndRedirect('/puzzle/level1');

    expect(goto).toHaveBeenCalledWith('/puzzle', { replaceState: true });
  });

  it('should allow subroutes after visiting start path', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // Visit start path first
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // Now subroutes should be allowed
    context.validateAndRedirect('/puzzle/level1');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzle/level2');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect paths outside route scope', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // Paths that do not start with startPath should be allowed
    context.validateAndRedirect('/other/path');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzled'); // Not a subroute
    expect(goto).not.toHaveBeenCalled();
  });

  it('should use custom redirect URL when provided', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    context.validateAndRedirect('/puzzle/level1', '/puzzle/welcome');

    expect(goto).toHaveBeenCalledWith('/puzzle/welcome', {
      replaceState: true
    });
  });
});

describe('RouteStateContext - Complex Navigation Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle multi-level navigation with enforcement', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // Try to access deep subroute without visiting start
    context.validateAndRedirect('/puzzle/level1/sublevel');
    expect(goto).toHaveBeenCalledTimes(1);
    expect(goto).toHaveBeenCalledWith('/puzzle', { replaceState: true });

    vi.clearAllMocks();

    // Visit start path
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // Now deep subroutes should work
    context.validateAndRedirect('/puzzle/level1/sublevel');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should persist visited state across multiple checks', () => {
    const context = new RouteStateContext({
      startPath: '/onboarding',
      enforceStartPath: true
    });

    // Visit start path
    context.validateAndRedirect('/onboarding');

    // Multiple subroute checks should all pass
    context.validateAndRedirect('/onboarding/step1');
    context.validateAndRedirect('/onboarding/step2');
    context.validateAndRedirect('/onboarding/step3');

    expect(goto).not.toHaveBeenCalled();
  });

  it('should handle query parameters and fragments', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // Visit start path first (exact match)
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // Subroutes with query params should work after visiting start path
    context.validateAndRedirect('/puzzle/level1?score=100#section');
    expect(goto).not.toHaveBeenCalled();
  });
});

describe('RouteStateContext - Real World Example', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should work in a puzzle game onboarding flow', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // User tries to directly access level 2 (not allowed)
    context.validateAndRedirect('/puzzle/level2');
    expect(goto).toHaveBeenCalledWith('/puzzle', { replaceState: true });
    vi.clearAllMocks();

    // User is now on intro page (start path)
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // User can now freely navigate to any level
    context.validateAndRedirect('/puzzle/tutorial');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzle/level1');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzle/level2');
    expect(goto).not.toHaveBeenCalled();

    context.validateAndRedirect('/puzzle/complete');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should allow custom welcome redirect', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // User tries to skip to level 2, redirect to welcome page
    context.validateAndRedirect('/puzzle/level2', '/puzzle/welcome');

    expect(goto).toHaveBeenCalledWith('/puzzle/welcome', {
      replaceState: true
    });
  });
});

describe('RouteStateContext - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle trailing slashes correctly', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    context.validateAndRedirect('/puzzle/');
    // Should redirect because /puzzle/ is not exactly /puzzle
    expect(goto).toHaveBeenCalledWith('/puzzle', { replaceState: true });
  });

  it('should handle paths with similar prefixes', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // /puzzled is not a subroute of /puzzle
    context.validateAndRedirect('/puzzled');
    expect(goto).not.toHaveBeenCalled();

    // /puzzle-game is not a subroute of /puzzle
    context.validateAndRedirect('/puzzle-game');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should handle empty string paths', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    context.validateAndRedirect('');
    expect(goto).not.toHaveBeenCalled();
  });

  it('should not redirect when checking same path repeatedly', () => {
    const context = new RouteStateContext({
      startPath: '/puzzle',
      enforceStartPath: true
    });

    // Visit start path
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // Check same path again
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();

    // Still should not redirect
    context.validateAndRedirect('/puzzle');
    expect(goto).not.toHaveBeenCalled();
  });
});
