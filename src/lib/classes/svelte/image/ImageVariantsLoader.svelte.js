/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

// import * as expect from '@hkdigital/lib-sveltekit/util/expect/index.js';

import { untrack } from 'svelte';

import ImageLoader from './ImageLoader.svelte.js';

export default class ImageMetasLoader {
  /** @type {number} */
  #devicePixelRatio;

  /** @type {ImageMeta[]} */
  #imagesMeta;

  /** @type {ImageMeta|null} */
  #imageVariant = $state(null);

  /** @type {ImageLoader|null} */
  #imageLoader = $state(null);

  #progress = $derived.by(() => {
    if (this.#imageLoader) {
      // const progress = this.#imageLoader.progress;

      return this.#imageLoader.progress;
    } else {
      return { bytesLoaded: 0, size: 0, loaded: false };
    }
  });

  #loaded = $derived(this.#progress.loaded);

  /**
   * @param {ImageMeta[]} imagesMeta
   */
  constructor(imagesMeta, { devicePixelRatio = 1 } = {}) {
    // expect.notEmptyArray( imagesMeta );

    this.#devicePixelRatio = devicePixelRatio ?? 1;

    // Sort images meta by width ascending
    this.#imagesMeta = [...imagesMeta].sort((a, b) => a.width - b.width);

    $effect(() => {
      const variant = this.#imageVariant;

      if (variant) {
        // console.log('Load new variant', $state.snapshot(variant));

        // TODO: abort loading if imageLoader exists

        untrack(() => {
          const loader = (this.#imageLoader = new ImageLoader({
            url: variant.src
          }));

          loader.load();
        });
      }
    });
  }

  /**
   * Set new optimal image variant or keep current
   *
   * @param {number} containerWidth
   */
  updateOptimalImageMeta(containerWidth) {
    const newVariant = this.getOptimalImageMeta(containerWidth);

    if (
      !newVariant ||
      !this.#imageVariant ||
      newVariant.width > this.#imageVariant.width
    ) {
      // Only update imageVariant is width is larger
      this.#imageVariant = newVariant;
    }
  }

  get loaded() {
    return this.#loaded;
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
  getObjectUrl() {
    // Example usage:
    //
    // $effect(() => {
    //   if (variantsLoader.loaded) {
    //     // @ts-ignore
    //     imageUrl = variantsLoader.getObjectUrl();
    //   }

    //   return () => {
    //     if (imageUrl) {
    //       URL.revokeObjectURL(imageUrl);
    //       imageUrl = null;
    //     }
    //   };
    // });

    const blob = this.#imageLoader?.getBlob();

    const url = blob ? URL.createObjectURL(blob) : null;

    return url;
  }

  get progress() {
    return this.#progress;
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
} // end class
