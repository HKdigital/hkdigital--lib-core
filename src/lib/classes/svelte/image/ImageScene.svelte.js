/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import * as expect from '$lib/util/expect/index.js';

import {
  LoadingStateMachine,
  STATE_INITIAL,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_LOADED,
  STATE_CANCELLED,
  STATE_ERROR,
  LOAD,
  // CANCEL,
  ERROR,
  LOADED,
  UNLOAD,
  INITIAL
} from '$lib/classes/svelte/loading-state-machine/index.js';

import ImageLoader from '$lib/classes/svelte/image/ImageLoader.svelte.js';

/**
 * @typedef {object} SourceConfig
 * // property ...
 */

/**
 * @typedef {object} ImageSource
 * @property {string} label
 * @property {ImageLoader} imageLoader
 * @property {ImageMeta} [imageMeta]
 */

export default class ImageScene {
  #state = new LoadingStateMachine();

  // @note this exported state is set by $effect's
  state = $state(STATE_INITIAL);

  // @note this exported state is set by $effect's
  loaded = $derived.by(() => {
    return this.state === STATE_LOADED;
  });

  /** @type {ImageSource[]} */
  #imageSources = $state([]);

  #progress = $derived.by(() => {
    // console.log('update progress');

    let totalSize = 0;
    let totalBytesLoaded = 0;
    let sourcesLoaded = 0;

    const sources = this.#imageSources;
    const numberOfSources = sources.length;

    for (let j = 0; j < numberOfSources; j++) {
      const source = sources[j];
      const { imageLoader } = source;

      const { bytesLoaded, size, loaded } = imageLoader.progress;

      totalSize += size;
      totalBytesLoaded += bytesLoaded;

      if (loaded) {
        sourcesLoaded++;
      }
    } // end for

    return {
      totalBytesLoaded,
      totalSize,
      sourcesLoaded,
      numberOfSources
    };
  });

  /**
   * Construct ImageScene
   */
  constructor() {
    const state = this.#state;

    $effect(() => {
      if (state.current === STATE_LOADING) {
        // console.log(
        //   'progress',
        //   JSON.stringify($state.snapshot(this.#progress))
        // );

        const { sourcesLoaded, numberOfSources } = this.#progress;

        if (sourcesLoaded === numberOfSources) {
          // console.log(`All [${numberOfSources}] sources loaded`);
          this.#state.send(LOADED);
        }
      }
    });

    $effect(() => {
      switch (state.current) {
        case STATE_LOADING:
          {
            // console.log('ImageScene:loading');
            this.#startLoading();
          }
          break;

        case STATE_UNLOADING:
          {
            // console.log('ImageScene:unloading');
            // this.#startUnLoading();
          }
          break;

        case STATE_LOADED:
          {
            // console.log('ImageScene:loaded');
            // TODO
            // this.#abortLoading = null;
          }
          break;

        case STATE_CANCELLED:
          {
            // console.log('ImageScene:cancelled');
            // TODO
          }
          break;

        case STATE_ERROR:
          {
            console.log('ImageScene:error', state.error);
          }
          break;
      } // end switch

      this.state = state.current;
    });
  }

  destroy() {
    // TODO: disconnect all image sources?
    // TODO: Unload ImageLoaders?
  }

  /**
   * Add image source
   * - Uses an ImageLoader instance to load image data from network
   *
   * @param {object} _
   * @param {string} _.label
   * @param {ImageMeta|ImageMeta[]} _.imageMeta
   */
  defineImage({ label, imageMeta }) {
    expect.notEmptyString(label);

    // expect.notEmptyString(url);

    const imageLoader = new ImageLoader({ imageMeta });

    this.#imageSources.push({ label, imageLoader, imageMeta });
  }

  /**
   * Start loading all image sources
   */
  load() {
    this.#state.send(LOAD);

    // FIXME: in unit test when moved to startloading it hangs!

    for (const { imageLoader } of this.#imageSources) {
      imageLoader.load();
    }
  }

  async #startLoading() {
    // console.log('#startLoading');
    // FIXME: in unit test when moved to startloading it hangs!
    // for (const { audioLoader } of this.#memorySources) {
    //   audioLoader.load();
    // }
  }

  /**
   * Get Image source
   *
   * @param {string} label
   *
   * @returns {ImageSource}
   */
  #getImageSource(label) {
    for (const source of this.#imageSources) {
      if (label === source.label) {
        return source;
      }
    }

    throw new Error(`Source [${label}] has not been defined`);
  }

  /**
   * Get image scene loading progress
   */
  get progress() {
    return this.#progress;
  }

  /**
   * Get an image loader
   *
   * @param {string} label
   *
   * @returns {ImageLoader}
   */
  getImageLoader(label) {
    const source = this.#getImageSource(label);

    return source.imageLoader;
  }

  /**
   * Get object URL that can be used as src parameter of an HTML image
   *
   * @param {string} label
   *
   * @returns {ImageMeta}
   */
  getImageMeta(label) {
    const source = this.#getImageSource(label);

    return source.imageMeta;
  }

  /**
   * Get object URL that can be used as src parameter of an HTML image
   *
   * @param {string} label
   *
   * @note the objectURL should be revoked when no longer used
   *
   * @returns {string}
   */
  getObjectURL(label) {
    const source = this.#getImageSource(label);

    return source.imageLoader.getObjectURL();
  }
}
