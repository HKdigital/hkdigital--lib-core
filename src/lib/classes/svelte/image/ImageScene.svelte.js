/**
 * A simple class to preload and manage images for a scene
 *
 * @typedef {import('$lib/config/typedef.js').ImageMeta} ImageMeta
 */
import { ImageLoader } from '$lib/classes/svelte/image/index.js';

export default class ImageScene {
  /** @type {Map<string, ImageLoader>} */
  #loaders = $state.raw(new Map());

  /** @type {boolean} */
  #loading = $state(false);

  /** @type {boolean} */
  #loaded = $state(false);

  /** @type {{ bytesLoaded: number, size: number, loaded: boolean }} */
  #progress = $state({ bytesLoaded: 0, size: 0, loaded: false });

  /**
   * Define an image to be managed by this scene
   *
   * @param {object} params
   * @param {string} params.label - Unique identifier for the image
   * @param {ImageMeta|ImageMeta[]} params.imageMeta - Image metadata (single or variants)
   */
  defineImage({ label, imageMeta }) {
    // Create loader for this image
    const loader = new ImageLoader({ imageMeta });
    this.#loaders.set(label, loader);
  }

  /**
   * Start loading all defined images
   */
  load() {
    if (this.#loading || this.#loaded) return;

    this.#loading = true;

    // Start loading all images
    for (const loader of this.#loaders.values()) {
      loader.load();
    }

    // Track overall loading progress
    $effect(() => {
      if (this.#loaders.size === 0) return;

      let totalBytesLoaded = 0;
      let totalSize = 0;
      let allLoaded = true;

      for (const loader of this.#loaders.values()) {
        const progress = loader.progress;

        totalBytesLoaded += progress.bytesLoaded;
        totalSize += progress.size || 0;

        if (!progress.loaded) {
          allLoaded = false;
        }
      }

      this.#progress = {
        bytesLoaded: totalBytesLoaded,
        size: totalSize,
        loaded: allLoaded
      };

      if (allLoaded && this.#loading) {
        this.#loaded = true;
      }
    });
  }

  /**
   * Unload all images and free resources
   */
  unload() {
    for (const loader of this.#loaders.values()) {
      loader.unload();
    }

    this.#loading = false;
    this.#loaded = false;
  }

  /**
   * Get the image loader for a specific label
   *
   * @param {string} label - Image identifier
   * @returns {ImageLoader|null} The image loader or null if not found
   */
  getImageLoader(label) {
    return this.#loaders.get(label) || null;
  }

  /**
   * Check if the scene is currently loading
   */
  get loading() {
    return this.#loading;
  }

  /**
   * Check if all images in the scene are loaded
   */
  get loaded() {
    return this.#loaded;
  }

  /**
   * Get the current loading progress
   */
  get progress() {
    return this.#progress;
  }
}
