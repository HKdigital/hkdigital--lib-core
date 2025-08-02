import { describe, it, expect } from 'vitest';

import { clamp } from './clamp.js';

describe('clamp', () => {
  it('should clamp values to max', () => {
    expect(clamp(0.3, 1.7, 1)).toEqual(1);
  });

  it('should clamp values to min', () => {
    expect(clamp(0.3, 0.1, 1)).toEqual(0.3);
  });
});
