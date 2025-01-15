import { describe, it, expect } from 'vitest';

import { ImageBox, ResponsiveImage } from './index.js';

describe('ImageBox', () => {
  it('should be a component (function)', () => {
    expect(typeof ImageBox).toBe('function');
  });
});

describe('ResponsiveImage', () => {
  it('should be a component (function)', () => {
    expect(typeof ResponsiveImage).toBe('function');
  });
});
