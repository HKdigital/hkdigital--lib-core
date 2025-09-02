/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import * as expect from '$lib/util/expect.js';

import { LoadingStateMachine } from '$lib/state/machines.js';

import {
  STATE_INITIAL,
  STATE_LOADING,
  STATE_LOADED,
  STATE_ABORTING,
  STATE_ABORTED,
  STATE_ERROR,
  LOAD,
  LOADED,
  ABORT,
  ABORTED
} from '$lib/state/machines.js';

import ImageLoader from './ImageLoader.svelte.js';

/**
 * @typedef {object} SourceConfig
 * // property ...
 */

/**
 * @typedef {object} ImageSceneSource
 * @property {string} label
 * @property {ImageLoader} imageLoader
 */

export default class ImageScene {
  #state = new LoadingStateMachine();

  // @note this exported state is set by onenter
  state = $state(STATE_INITIAL);

  loaded = $derived.by(() => {
    return this.state === STATE_LOADED;
  });

  /** @type {ImageSceneSource[]} */
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

  #abortProgress = $derived.by(() => {
    let sourcesAborted = 0;
    const sources = this.#imageSources;
    const numberOfSources = sources.length;

    for (let j = 0; j < numberOfSources; j++) {
      const source = sources[j];
      const { imageLoader } = source;
      const loaderState = imageLoader.state;

      if (loaderState === STATE_ABORTED || loaderState === STATE_ERROR) {
        sourcesAborted++;
      }
    } // end for

    return {
      sourcesAborted,
      numberOfSources
    };
  });

  #sourcesLoaded = $derived( this.#progress.sourcesLoaded );
  #numberOfSources = $derived( this.#progress.numberOfSources );

  /**
   * Construct ImageScene
   */
  constructor() {
    const state = this.#state;

    $effect( () => {
      if (state.current === STATE_LOADING) {
        if (this.#sourcesLoaded === this.#numberOfSources) {
          // console.log(`All [${this.#numberOfSources}] sources loaded`);
          this.#state.send(LOADED);
        }
      }
    } );

    $effect(() => {
      if (state.current === STATE_ABORTING) {
        const { sourcesAborted, numberOfSources } = this.#abortProgress;

        if (sourcesAborted === numberOfSources) {
          // console.debug(`ImageScene: ${numberOfSources} sources aborted`);
          this.#state.send(ABORTED);
        }
      }
    });

    state.onenter = ( currentState ) => {
      // console.log('onenter', currentState );

      if(currentState === STATE_LOADING )
      {
        // console.log('ImageScene:loading');
        this.#startLoading();
      }
      else if(currentState === STATE_ABORTING )
      {
        // console.log('ImageScene:aborting');
        this.#startAbort();
      }

      this.state = currentState;
    };
  }

  /* ==== Common loader interface */

  /**
   * Get image scene loading progress
   */
  get progress() {
    return this.#progress;
  }

  /**
   * Get image scene abort progress
   */
  get abortProgress() {
    return this.#abortProgress;
  }

  /**
   * Start loading all image sources
   */
  load() {
    this.#state.send(LOAD);
  }

  /**
   * Abort loading all image sources
   */
  abort() {
    this.#state.send(ABORT);
  }

  destroy() {
    // TODO: disconnect all image sources?
    // TODO: Unload ImageLoaders?
  }

  /* ==== Source definitions */

  /**
   * Add image source
   * - Uses an ImageLoader instance to load image data from network
   *
   * @param {object} _
   * @param {string} _.label
   * @param {import('$lib/config/typedef.js').ImageSource} _.imageSource
   */
  defineImage({ label, imageSource }) {
    expect.notEmptyString(label);

    // expect.notEmptyString(url);

    const imageLoader = new ImageLoader(imageSource);

    this.#imageSources.push({ label, imageLoader });
  }

  /* ==== Resource access */

  /**
   * Get an image loader
   *
   * @param {string} label
   *
   * @returns {ImageLoader}
   */
  getImageLoader(label) {
    const source = this.#getImageSceneSource(label);

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
    const source = this.#getImageSceneSource(label);

    return source.imageLoader.imageMeta;
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
    const source = this.#getImageSceneSource(label);

    return source.imageLoader.getObjectURL();
  }

  async #startLoading() {
    for (const { imageLoader } of this.#imageSources) {
      imageLoader.load();
    }
  }

  #startAbort() {
    for (const { imageLoader } of this.#imageSources) {
      imageLoader.abort();
    }
  }

  /* ==== Internals */

  /**
   * Get Image source
   *
   * @param {string} label
   *
   * @returns {ImageSceneSource}
   */
  #getImageSceneSource(label) {
    for (const source of this.#imageSources) {
      if (label === source.label) {
        return source;
      }
    }

    throw new Error(`Source [${label}] has not been defined`);
  }
} // end class
