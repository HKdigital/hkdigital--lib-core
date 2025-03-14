/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import { calculateEffectiveWidth } from '$lib/util/image/index.js';
import { untrack } from 'svelte';
import ImageLoader from './ImageLoader.svelte.js';

export default class ImageVariantsLoader {
  /** @type {number} */
  #devicePixelRatio;

  /** @type {ImageMeta[]} */
  #imagesMeta;

  /** @type {ImageMeta|null} */
  #imageVariant = $state(null);

  /** @type {ImageLoader|null} */
  #imageLoader = $state(null);

  /** @type {boolean} */
  #isObjectUrlCreated = $state(false);

  /** @type {boolean} */
  #variantLoaded = $state(false);

  /** @type {Object} */
  #baseProgress = $state({ bytesLoaded: 0, size: 0, loaded: false });

  constructor(imagesMeta, { devicePixelRatio = 1 } = {}) {
    this.#devicePixelRatio = devicePixelRatio ?? 1;
    this.#imagesMeta = [...imagesMeta].sort((a, b) => a.width - b.width);

    // Track the imageLoader's progress
    $effect(() => {
      if (this.#imageLoader) {
        // Store the base progress from the loader
        this.#baseProgress = this.#imageLoader.progress;

        // When the base image is loaded, we can say variant is loaded
        // if an object URL has been created
        if (this.#baseProgress.loaded && this.#isObjectUrlCreated) {
          this.#variantLoaded = true;
        }
      }
    });
  }

  /**
   * Set new optimal image variant or keep current
   *
   * @param {object} params
   * @param {number} [params.containerWidth] Container width
   * @param {number} [params.containerHeight] Container height
   * @param {'cover'|'contain'|'fill'} [params.fit='contain'] Fit mode
   */
  updateOptimalImageMeta({ containerWidth, containerHeight, fit = 'contain' }) {
    const baseImage = this.#imagesMeta[0];
    const imageAspectRatio = baseImage.width / baseImage.height;

    const effectiveWidth = calculateEffectiveWidth({
      containerWidth,
      containerHeight,
      imageAspectRatio,
      fit
    });

    const newVariant = this.getOptimalImageMeta(effectiveWidth);

    if (
      !newVariant ||
      !this.#imageVariant ||
      newVariant.width > this.#imageVariant.width
    ) {
      this.#imageVariant = newVariant;

      // Reset our loaded flags when changing variants
      this.#isObjectUrlCreated = false;
      this.#variantLoaded = false;

      // Clean up and create a new loader
      if (this.#imageLoader?.initial) {
        this.#imageLoader.unload();
      }

      this.#imageLoader = new ImageLoader({
        imageMeta: newVariant
      });

      this.#imageLoader.load();
    }
  }

  get loaded() {
    return this.#variantLoaded;
  }

  get variant() {
    return this.#imageVariant;
  }

  /**
   * Get object URL that can be used as src parameter of an HTML image
   *
   * @note the objectURL should be revoked when no longer used
   *
   * @returns {string|null}
   */
  getObjectURL() {
    if (!this.#imageLoader) {
      return null;
    }

    const blob = this.#imageLoader.getBlob();

    if (!blob) {
      return null;
    }

    // Get the URL
    const url = URL.createObjectURL(blob);

    // Mark that we've successfully created an object URL
    this.#isObjectUrlCreated = true;

    // If the underlying loader is also loaded, we can consider
    // the whole variant loaded
    if (this.#baseProgress.loaded) {
      this.#variantLoaded = true;
    }

    return url;
  }

  get progress() {
    // Only return loaded:true in the progress when we're fully loaded
    return {
      bytesLoaded: this.#baseProgress.bytesLoaded,
      size: this.#baseProgress.size,
      loaded: this.#variantLoaded
    };
  }

  /**
   * Get optimal image variant
   *
   * @param {number} containerWidth
   *
   * @returns {ImageMeta|null}
   */
  getOptimalImageMeta(containerWidth) {
    if (!containerWidth) {
      return null;
    }

    // Calculate the required width (container * DPR)
    const requiredWidth = containerWidth * this.#devicePixelRatio;

    const imagesMeta = this.#imagesMeta;

    // Find the smallest image that's larger than our required width
    const optimal = imagesMeta.find(
      (current) => current.width >= requiredWidth
    );

    // Fall back to the largest image if nothing is big enough
    return optimal || imagesMeta[imagesMeta.length - 1];
  }
}
