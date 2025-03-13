import { describe, it, expect } from 'vitest';

import { ImageBox } from './index.js';

describe('ImageBox', () => {
  it('should be a component (function)', () => {
    expect(typeof ImageBox).toBe('function');
  });
});
