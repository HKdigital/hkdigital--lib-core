import { describe, it, expect } from 'vitest';

import { URL_SLUG } from './url.js';

// > Test

describe('Regexp {URL_SLUG}', () => {
  it('should match valid URL slugs', () => {
    const re = new RegExp(URL_SLUG, 'v');

    const cases = [
      'hello',
      'world',
      'hello-world',
      'my-blog-post',
      'user-123',
      'product-abc-123',
      'a',
      '1',
      'abc123',
      'hello-world-foo-bar'
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(true);
    }
  });

  it('should not match invalid URL slugs', () => {
    const re = new RegExp(URL_SLUG, 'v');

    const cases = [
      '',
      '-hello',
      'hello-',
      'hello--world',
      'hello_world',
      'hello world',
      'hello.world',
      'hello/world',
      'héllo',
      'world!',
      'hello@world',
      'hello#world',
      'hello?world'
    ];

    for (const str of cases) {
      expect(re.test(str)).toBe(false);
    }
  });
});