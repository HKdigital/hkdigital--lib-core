import { calculateEffectiveWidth } from './utils/index.js';

import ImageLoader from './ImageLoader.svelte.js';

/** @typedef {import('../typedef.js').ImageMeta} ImageMeta */

export default class ImageVariantsLoader {
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
      return this.#imageLoader.progress;
    } else {
      return { bytesLoaded: 0, size: 0, loaded: false };
    }
  });

  #loaded = $derived.by(() => this.#progress?.loaded || false);

  /**
   * @param {ImageMeta[]} imagesMeta
   */
  constructor(imagesMeta, { devicePixelRatio = 1 } = {}) {
    this.#devicePixelRatio = devicePixelRatio ?? 1;
    this.#imagesMeta = [...imagesMeta].sort((a, b) => a.width - b.width);
    // console.debug("imagesMeta",imagesMeta);
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

    // console.debug("updateOptimalImageMeta", effectiveWidth, newVariant );

    if (
      !newVariant ||
      !this.#imageVariant ||
      newVariant.width > this.#imageVariant.width
    ) {
      this.#imageVariant = newVariant;

      // Create and start loader here directly when variant changes
      if (this.#imageLoader?.initial) {
        this.#imageLoader.unload();
      }

      this.#imageLoader = new ImageLoader(newVariant);


      this.#imageLoader.load();
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
  getObjectURL() {
    // Example usage:
    //
    // $effect(() => {
    //   if (variantsLoader.loaded) {
    //     // @ts-ignore
    //     imageUrl = variantsLoader.getObjectURL();
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
