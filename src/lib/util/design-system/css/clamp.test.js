import { describe, it, expect } from 'vitest';

import { clamp } from './clamp.js';

describe('clamp', () => {
  it('should clamp values', () => {
    expect(clamp(1.7, 0.3, 1)).toEqual(1);
  });
});
