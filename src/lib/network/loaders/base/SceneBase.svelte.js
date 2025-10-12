import { DetailedError } from '$lib/generic/errors.js';

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
import { TimeoutError } from '$lib/generic/errors.js';

const MAX_TIMEOUT_MS = 120000;

/** @typedef {import('./typedef.js').SceneLoadingProgress} SceneLoadingProgress */

/**
 * Base class for scene loaders that manage collections of media sources
 */
export default class SceneBase {
  #state = new LoadingStateMachine();

  // @note this exported state is set by onenter
  state = $state(STATE_INITIAL);

  initial = $derived.by(() => {
    return this.state === STATE_INITIAL;
  });

  loaded = $derived.by(() => {
    return this.state === STATE_LOADED;
  });

  // aborted = $derived.by(() => {
  //   return this.state === STATE_ABORTED;
  // });

  /** @type {((progress:SceneLoadingProgress)=>void)[]} */
  #preloadListeners = [];

  /** @type {SceneLoadingProgress|null} */
  #lastReportedProgress = null;

  /** @type {SceneLoadingProgress} */
  progress = $derived.by(() => {
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

    let percentageLoaded;
    if (totalSize > 0) {
      // Byte-based progress
      percentageLoaded = Math.round((totalBytesLoaded / totalSize) * 100);
    } else if (numberOfSources > 0) {
      // Source-based progress
      percentageLoaded = Math.round((sourcesLoaded / numberOfSources) * 100);
    } else {
      // No sources to load
      percentageLoaded = 0;
    }

    return {
      totalBytesLoaded,
      totalSize,
      sourcesLoaded,
      numberOfSources,
      percentageLoaded
    };
  });

  /**
   * Construct SceneBase
   */
  constructor() {
    this.#state.onenter = (currentState) => {
      if (currentState === STATE_LOADING) {
        this.#startLoading();
      } else if (currentState === STATE_ABORTING) {
        this.#startAbort();
      }

      this.state = currentState;
    };

    $effect(() => {
      if (this.state === STATE_LOADING) {
        const { sourcesLoaded, numberOfSources } = this.progress;

        if (sourcesLoaded === numberOfSources && numberOfSources > 0) {
          this.#state.send(LOADED);
        }
      }
    });

    $effect(() => {
      if (this.state === STATE_LOADING) {
        // Check if any source failed during loading
        const sources = this.sources;

        for (const source of sources) {
          const loader = this.getLoaderFromSource(source);
          if (loader.state === STATE_ERROR) {
            this.#state.send(
              ERROR,
              loader.error || new Error('Source loading failed')
            );
            break;
          }
        }
      }
    });

    $effect(() => {
      this.#updatePreloadProgressListeners(this.progress);
    });
  } // end constructor

  /**
   * Call preload progress listeners (with deduplication)
   *
   * @param {SceneLoadingProgress} progress
   */
  #updatePreloadProgressListeners(progress) {
    // Skip if progress hasn't actually changed
    if (this.#lastReportedProgress && 
        this.#lastReportedProgress.totalBytesLoaded === progress.totalBytesLoaded &&
        this.#lastReportedProgress.totalSize === progress.totalSize &&
        this.#lastReportedProgress.sourcesLoaded === progress.sourcesLoaded &&
        this.#lastReportedProgress.numberOfSources === progress.numberOfSources &&
        this.#lastReportedProgress.percentageLoaded === progress.percentageLoaded) {
      return;
    }

    // Update last reported progress
    this.#lastReportedProgress = { ...progress };

    for (const fn of this.#preloadListeners) {
      try {
        fn(progress);
      } catch (e) {
        throw new DetailedError(
          'Error in progress listener',
          null,
          /** @type {Error} */ (e)
        );
      }
    }
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
    let progressIntervalId = null;

    let isAborted = false;

    const abort = () => {
      if (isAborted) return;
      isAborted = true;

      // Remove progress listener
      if (onProgress) {
        const index = this.#preloadListeners.indexOf(onProgress);
        if (index >= 0) {
          this.#preloadListeners.splice(index, 1);
        }
      }

      if (progressIntervalId) {
        clearInterval(progressIntervalId);
        progressIntervalId = null;
      }

      this.abort();
    };

    const promise = new Promise((resolve, reject) => {
      // Set up progress tracking with reactive listener
      if (onProgress) {
        this.#preloadListeners.push(onProgress);
      }

      // // Set up progress tracking with polling (fallback if reactive doesn't work)
      // if (onProgress) {
      //   progressIntervalId = setInterval(() => {
      //     if (!isAborted && this.state === STATE_LOADING) {
      //       const currentProgress = this.progress;
      //       onProgress(currentProgress);
      //     }
      //   }, 50); // Poll every 50ms
      // }

      // // Set up progress tracking with polling (fallback if reactive doesn't work)
      // if (onProgress) {
      //   progressIntervalId = setInterval(() => {
      //     if (!isAborted && this.state === STATE_LOADING) {
      //       const currentProgress = this.progress;
      //       onProgress(currentProgress);
      //     }
      //   }, 50); // Poll every 50ms
      // }

      // Start loading
      this.load();

      // Wait for completion with timeout
      // 0 means no timeout, but actually we use max timeout
      const waitTimeout = timeoutMs > 0 ? timeoutMs : MAX_TIMEOUT_MS;

      waitForState(() => {
        return (
          this.loaded ||
          this.state === STATE_ABORTED ||
          this.state === STATE_ERROR
        );
      }, waitTimeout)
        .then(() => {
          // Remove progress listener
          if (onProgress) {
            const index = this.#preloadListeners.indexOf(onProgress);
            if (index >= 0) {
              this.#preloadListeners.splice(index, 1);
            }

          }

          // Cleanup polling (fallback if reactive doesn't work)
          if (progressIntervalId) {
            clearInterval(progressIntervalId);
            progressIntervalId = null;

            // Send final progress when loading completes (for polling fallback)
            if (onProgress && this.loaded) {
              const finalProgress = this.progress;
              onProgress(finalProgress);
            }
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
        .catch((error) => {
          // Handle timeout errors from waitForState
          if (error instanceof TimeoutError) {
            abort();
            reject(new Error(`Preload timed out after ${timeoutMs}ms`));
          } else {
            reject(error);
          }
        })
        .finally(() => {
          // Send final progress update regardless of success/failure
          if (onProgress) {
            const finalProgress = this.progress;
            onProgress(finalProgress);
            
            // Remove progress listener
            const index = this.#preloadListeners.indexOf(onProgress);
            if (index >= 0) {
              this.#preloadListeners.splice(index, 1);
            }
          }

          // // Cleanup polling (fallback if reactive doesn't work)
          // if (progressIntervalId) {
          //   clearInterval(progressIntervalId);
          //   progressIntervalId = null;
          // }
        });
    });

    return { promise, abort };
  }

  destroy() {
    // TODO: disconnect all sources?
    // TODO: Unload loaders?
  }

  /* ==== Internal methods */

  #startLoading() {
    // Handle empty scenes - immediately transition to loaded if no sources
    if (this.sources.length === 0) {
      // Use setTimeout to avoid re-entrant state machine calls
      setTimeout(() => {
        if (this.#state.current === STATE_LOADING) {
          this.#state.send(LOADED);
        }
      }, 0);
      return;
    }

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

    // Defer ABORTED transition to avoid re-entrant state machine calls
    setTimeout(() => {
      // Only transition to ABORTED if still in ABORTING state
      if (this.#state.current === STATE_ABORTING) {
        this.#state.send(ABORTED);
      }
    }, 0);
  }
}
