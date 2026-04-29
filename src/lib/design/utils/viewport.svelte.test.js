import { describe, it, expect, vi, beforeEach } from 'vitest';

import { enableViewportBreakpoints } from './viewport.js';

function setWidth(width) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width
  });
}

describe('enableViewportBreakpoints', () => {
  const breakpoints = { sm: 640, md: 768, lg: 1024 };

  beforeEach(() => {
    delete document.documentElement.dataset.viewport;
  });

  it('sets responsive for width below sm', () => {
    setWidth(400);
    const cleanup = enableViewportBreakpoints(breakpoints);
    expect(document.documentElement.dataset.viewport).toBe('responsive');
    cleanup();
  });

  it('sets sm for width >= 640', () => {
    setWidth(640);
    const cleanup = enableViewportBreakpoints(breakpoints);
    expect(document.documentElement.dataset.viewport).toBe('sm');
    cleanup();
  });

  it('sets md for width >= 768', () => {
    setWidth(800);
    const cleanup = enableViewportBreakpoints(breakpoints);
    expect(document.documentElement.dataset.viewport).toBe('md');
    cleanup();
  });

  it('sets lg for width >= 1024', () => {
    setWidth(1200);
    const cleanup = enableViewportBreakpoints(breakpoints);
    expect(document.documentElement.dataset.viewport).toBe('lg');
    cleanup();
  });

  it('auto-adds responsive:0 when no 0-value breakpoint is provided', () => {
    setWidth(300);
    const cleanup = enableViewportBreakpoints({ sm: 640, md: 768 });
    expect(document.documentElement.dataset.viewport).toBe('responsive');
    cleanup();
  });

  it('uses custom 0-value breakpoint name instead of responsive', () => {
    setWidth(300);
    const cleanup = enableViewportBreakpoints({ xs: 0, sm: 640 });
    expect(document.documentElement.dataset.viewport).toBe('xs');
    cleanup();
  });

  it('updates data-viewport on resize', () => {
    setWidth(400);
    const cleanup = enableViewportBreakpoints(breakpoints);
    expect(document.documentElement.dataset.viewport).toBe('responsive');

    setWidth(1024);
    window.dispatchEvent(new Event('resize'));
    expect(document.documentElement.dataset.viewport).toBe('lg');

    cleanup();
  });

  it('cleanup removes the resize listener', () => {
    const spy = vi.spyOn(window, 'removeEventListener');
    setWidth(400);
    const cleanup = enableViewportBreakpoints(breakpoints);
    cleanup();
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
    spy.mockRestore();
  });
});
