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
  ABORTED,
  ERROR
} from '$lib/state/machines.js';

import { waitForState } from '$lib/util/svelte.js';

/** @typedef {import('./typedef.js').SceneLoadingProgress} SceneLoadingProgress */

/**
 * Base class for scene loaders that manage collections of media sources
 */
export default class SceneBase {
  #state = new LoadingStateMachine();

  // @note this exported state is set by onenter
  state = $state(STATE_INITIAL);

  loaded = $derived.by(() => {
    return this.state === STATE_LOADED;
  });

  /** @type {SceneLoadingProgress} */
  #progress = $derived.by(() => {
    let totalSize = 0;
    let totalBytesLoaded = 0;
    let sourcesLoaded = 0;

    const sources = this.sources;
    const numberOfSources = sources.length;

    for (let j = 0; j < numberOfSources; j++) {
      const source = sources[j];
      const loader = this.getLoaderFromSource(source);

      const { bytesLoaded, size, loaded } = loader.progress;

      totalSize += size;
      totalBytesLoaded += bytesLoaded;

      if (loaded) {
        sourcesLoaded++;
      }
    }

    return {
      totalBytesLoaded,
      totalSize,
      sourcesLoaded,
      numberOfSources
    };
  });

  #abortProgress = $derived.by(() => {
    let sourcesAborted = 0;
    const sources = this.sources;
    const numberOfSources = sources.length;

    for (let j = 0; j < numberOfSources; j++) {
      const source = sources[j];
      const loader = this.getLoaderFromSource(source);
      const loaderState = loader.state;

      if (loaderState === STATE_ABORTED || loaderState === STATE_ERROR) {
        sourcesAborted++;
      }
    }

    return {
      sourcesAborted,
      numberOfSources
    };
  });

  /**
   * Construct SceneBase
   */
  constructor() {
    const state = this.#state;

    $effect(() => {
      if (this.state === STATE_LOADING) {
        const { sourcesLoaded, numberOfSources } = this.#progress;

        if (sourcesLoaded === numberOfSources && numberOfSources > 0) {
          this.#state.send(LOADED);
        }
      }
    });

    $effect(() => {
      if (this.state === STATE_ABORTING) {
        const { sourcesAborted, numberOfSources } = this.#abortProgress;

        if (sourcesAborted === numberOfSources && numberOfSources > 0) {
          this.#state.send(ABORTED);
        }
      }
    });

    $effect(() => {
      if (this.#state.current === STATE_LOADING) {
        // Check if any source failed during loading
        const sources = this.sources;
        for (const source of sources) {
          const loader = this.getLoaderFromSource(source);
          if (loader.state === STATE_ERROR) {
            this.#state.send(ERROR, loader.error || new Error('Source loading failed'));
            break;
          }
        }
      }
    });

    state.onenter = (currentState) => {
      if (currentState === STATE_LOADING) {
        this.#startLoading();
      } else if (currentState === STATE_ABORTING) {
        this.#startAbort();
      }

      this.state = currentState;
    };
  }

  /* ==== Abstract methods - must be implemented by subclasses */

  /**
   * Get the array of sources managed by this scene
   *
   * @returns {Array<object>} Array of source objects
   */
  get sources() {
    throw new Error('Subclass must implement sources getter');
  }

  /**
   * Extract the loader from a source object
   *
   * @param {object} source - Source object
   *
   * @returns {import('$lib/network/states/index.js').NetworkLoader} loader
   */
  // eslint-disable-next-line no-unused-vars
  getLoaderFromSource(source) {
    throw new Error('Subclass must implement getLoaderFromSource method');
  }

  /* ==== Common loader interface */

  /**
   * Get scene loading progress
   */
  get progress() {
    return this.#progress;
  }

  /**
   * Get scene abort progress
   */
  get abortProgress() {
    return this.#abortProgress;
  }

  /**
   * Start loading all sources
   */
  load() {
    this.#state.send(LOAD);
  }

  /**
   * Abort loading all sources
   */
  abort() {
    this.#state.send(ABORT);
  }

  /**
   * Preload all sources with progress tracking and abort capability
   *
   * @param {object} [options]
   * @param {number} [options.timeoutMs=10000]
   *   Timeout in milliseconds
   * @param {(progress: SceneLoadingProgress) => void} [options.onProgress]
   *   Progress callback function
   *
   * @returns {{promise: Promise<SceneBase>, abort: Function}}
   *   Object with promise that resolves when loaded and abort function
   */
  preload({ timeoutMs = 10000, onProgress } = {}) {

    /** @type {number|NodeJS.Timeout|null} */
    let timeoutId = null;

    /** @type {number|NodeJS.Timeout|null} */
    let progressIntervalId = null;

    let isAborted = false;

    const abort = () => {
      if (isAborted) return;
      isAborted = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        progressIntervalId = null;
      }

      this.abort();
    };

    const promise = new Promise((resolve, reject) => {
      // Set up progress tracking with polling
      if (onProgress) {
        progressIntervalId = setInterval(() => {
          if (!isAborted) {
            onProgress(this.progress);
          }
        }, 50); // Poll every 50ms
      }

      // Set up timeout
      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          abort();
          reject(new Error(`Preload timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }

      // Start loading
      this.load();

      // Wait for completion with extended timeout
      const waitTimeout = Math.max(timeoutMs + 1000, 2000);
      waitForState(() => {
        return this.loaded ||
               this.state === STATE_ABORTED ||
               this.state === STATE_ERROR;
      }, waitTimeout)
        .then(() => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (progressIntervalId) {
            clearInterval(progressIntervalId);
            progressIntervalId = null;
          }

          if (isAborted || this.state === STATE_ABORTED) {
            reject(new Error('Preload was aborted'));
          } else if (this.state === STATE_ERROR) {
            reject(this.#state.error);
          } else if (this.loaded) {
            resolve(this);
          } else {
            reject(new Error(`Preload failed: unexpected state ${this.state}`));
          }
        })
        .catch(reject);
    });

    return { promise, abort };
  }

  destroy() {
    // TODO: disconnect all sources?
    // TODO: Unload loaders?
  }

  /* ==== Internal methods */

  #startLoading() {
    for (let i = 0; i < this.sources.length; i++) {
      const source = this.sources[i];
      const loader = this.getLoaderFromSource(source);

      loader.load();
    }
  }

  #startAbort() {
    for (const source of this.sources) {
      const loader = this.getLoaderFromSource(source);
      loader.abort();
    }
  }
}
