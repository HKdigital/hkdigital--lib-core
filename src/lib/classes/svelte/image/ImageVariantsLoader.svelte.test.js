// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitForState } from '$lib/util/svelte/wait/index.js';
import { createPngResponse } from './mocks.js';

// > Mocks
beforeEach(() => {
  global.fetch = vi.fn();
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
  global.URL.revokeObjectURL = vi.fn();

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  // @ts-ignore
  delete global.fetch;
  delete global.ResizeObserver;
  vi.restoreAllMocks();
});

import ImageVariantsLoader from './ImageVariantsLoader.svelte.js';

describe('ImageVariantsLoader', () => {
  it('should select optimal image variant and track loading', async () => {
    // Mock fetch to return a PNG for any URL
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    // Create sample image variants
    const imageVariants = [
      { src: 'http://localhost/image-small.png', width: 400, height: 300 },
      { src: 'http://localhost/image-medium.png', width: 800, height: 600 },
      { src: 'http://localhost/image-large.png', width: 1200, height: 900 }
    ];

    /** @type {ImageVariantsLoader} */
    let variantsLoader;

    const cleanup = $effect.root(() => {
      // Create variants loader with device pixel ratio 1
      variantsLoader = new ImageVariantsLoader(imageVariants, {
        devicePixelRatio: 1
      });

      // Initially no variant should be selected
      expect(variantsLoader.variant).toBe(null);
      expect(variantsLoader.loaded).toBe(false);

      // Update to get optimal variant for a 500px container
      variantsLoader.updateOptimalImageMeta({
        containerWidth: 500,
        containerHeight: 400,
        fit: 'contain'
      });

      // Check correct variant was selected (medium image)
      expect(variantsLoader.variant).not.toBe(null);
      expect(variantsLoader.variant.width).toBe(800);
    });

    // Wait for the image to load
    await waitForState(
      () => {
        return variantsLoader.loaded;
      },
      { timeout: 2000 }
    );

    // Verify the image is loaded
    expect(variantsLoader.loaded).toBe(true);

    // Verify progress is correctly reported
    expect(variantsLoader.progress.loaded).toBe(true);
    expect(variantsLoader.progress.bytesLoaded).toBe(67); // From createPngResponse

    // Check getObjectURL returns a URL
    const objectUrl = variantsLoader.getObjectURL();
    expect(objectUrl).toBe('blob:mock-url');

    // Test switching to a different variant
    variantsLoader.updateOptimalImageMeta({
      containerWidth: 1000,
      containerHeight: 800,
      fit: 'contain'
    });

    // Verify new variant was selected
    expect(variantsLoader.variant.width).toBe(1200);

    // Verify loaded state is reset when variant changes
    expect(variantsLoader.loaded).toBe(false);

    // Wait for the new variant to load
    await waitForState(
      () => {
        return variantsLoader.loaded;
      },
      { timeout: 2000 }
    );

    // Verify the new variant is now loaded
    expect(variantsLoader.loaded).toBe(true);

    cleanup();
  });

  it('should properly handle edge cases', async () => {
    // @ts-ignore
    fetch.mockResolvedValue(createPngResponse());

    // Create sample image variants (only one)
    const singleVariant = [
      { src: 'http://localhost/image-single.png', width: 800, height: 600 }
    ];

    /** @type {ImageVariantsLoader} */
    let variantsLoader;

    const cleanup = $effect.root(() => {
      variantsLoader = new ImageVariantsLoader(singleVariant);

      // Try to update with no container width
      variantsLoader.updateOptimalImageMeta({
        containerHeight: 400,
        fit: 'contain'
      });

      // Should not select a variant with no width
      expect(variantsLoader.variant).toBe(null);

      // Now update with proper dimensions
      variantsLoader.updateOptimalImageMeta({
        containerWidth: 900,
        containerHeight: 400,
        fit: 'contain'
      });

      // Should select the only available variant even if it's smaller
      expect(variantsLoader.variant.width).toBe(800);
    });

    await waitForState(
      () => {
        return variantsLoader.loaded;
      },
      { timeout: 2000 }
    );

    // Test object URL handling
    expect(variantsLoader.getObjectURL()).toBe('blob:mock-url');

    cleanup();
  });
});
