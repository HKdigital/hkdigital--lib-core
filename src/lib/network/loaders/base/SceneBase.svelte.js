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
      if (state.current === STATE_LOADING) {
        const { sourcesLoaded, numberOfSources } = this.#progress;

        if (sourcesLoaded === numberOfSources) {
          this.#state.send(LOADED);
        }
      }
    });

    $effect(() => {
      if (state.current === STATE_ABORTING) {
        const { sourcesAborted, numberOfSources } = this.#abortProgress;

        if (sourcesAborted === numberOfSources) {
          this.#state.send(ABORTED);
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
   * @returns {Array} Array of source objects
   */
  get sources() {
    throw new Error('Subclass must implement sources getter');
  }

  /**
   * Extract the loader from a source object
   *
   * @param {*} source
   *
   * @returns {*} Loader object with progress and state properties
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

  destroy() {
    // TODO: disconnect all sources?
    // TODO: Unload loaders?
  }

  /* ==== Internal methods */

  #startLoading() {
    for (const source of this.sources) {
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
