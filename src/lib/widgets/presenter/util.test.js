import { describe, it, expect } from 'vitest';

import { cssBefore, cssDuring } from './util.js';

import { slides } from './testdata.js';

describe('cssBefore', () => {
  it('should convert a transition into css style and classes', () => {
    const [t1, t2] = slides[0].intro || [];

    expect(cssBefore([t1]).style).toBe('opacity: 0');
    expect(cssBefore([t2]).style).toBe('transform: rotateX(180deg)');

    expect(cssBefore([t1, t2]).style).toBe(
      'opacity: 0;transform: rotateX(180deg)'
    );
  });
});

describe('cssDuring', () => {
  it('should convert a transition into css style and classes', () => {
    const [t1, t2] = slides[0].intro || [];

    expect(cssDuring([t1]).style).toBe(
      'opacity: 1;transition: opacity 2000ms ease 0ms'
    );
    expect(cssDuring([t2]).style).toBe(
      'transform: rotateX(0deg);transition: transform 2000ms ease 0ms'
    );

    expect(cssDuring([t1, t2]).style).toBe(
      'opacity: 1;transform: rotateX(0deg);transition: opacity 2000ms ease 0ms,transform 2000ms ease 0ms'
    );
  });
});
