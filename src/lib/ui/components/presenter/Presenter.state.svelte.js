import { tick } from 'svelte';

import { findFirst } from '$lib/util/array/index.js';

import { untrack } from 'svelte';

import { HkPromise } from '$lib/generic/promises.js';

import { STAGE_BEFORE, STAGE_SHOW } from './constants.js';

/**
 * @typedef {import("./typedef").Slide} Slide
 */

/**
 * @typedef {import("./typedef").Transition} Transition
 */

/**
 * @typedef {import("./typedef").Layer} Layer
 */

/**
 * @typedef {import("./typedef").PresenterRef} PresenterRef
 */

/**
 * @typedef {import("./typedef").LoadController} LoadController
 */

/**
 * @typedef {import("./typedef").ListenerParams} ListenerParams
 */

const Z_BACK = 0;
const Z_FRONT = 10;

const LABEL_A = 'A';
const LABEL_B = 'B';

export class PresenterState {
  /** @type {Slide[]} */
  slides = $state.raw([]);

  /** @type {Layer} */
  layerA = $state.raw({ z: Z_BACK, visible: false, stageIdle: true });

  /** @type {Layer} */
  layerB = $state.raw({ z: Z_FRONT, visible: false, stageIdle: true });

  /** @type {Slide|null} */
  slideA = $state.raw(null);

  /** @type {Slide|null} */
  slideB = $state.raw(null);

  /** @type {string} */
  currentLayerLabel = $state(LABEL_B);

  /** @type {string} */
  nextLayerLabel = $state(LABEL_A);

  /** @type {HkPromise[]} */
  transitionPromises = $state.raw([]);

  /** @type {HkPromise} */
  slideLoadingPromise = null;

  /** @type {boolean} */
  isSlideLoading = $state(false);

  /** @type {boolean} */
  loadingSpinner = $state(false);

  /** @type {boolean} */
  busy = $derived.by(() => {
    const { layerA, layerB, isSlideLoading } = this;

    const layerAStable =
      layerA.stageShow || layerA.stageAfter || layerA.stageIdle;
    const layerBStable =
      layerB.stageShow || layerB.stageAfter || layerB.stageIdle;

    return !(layerAStable && layerBStable) || isSlideLoading;
  });

  /** @type {string} */
  currentSlideName = $derived.by(() => {
    const currentSlide = this.#getSlide(this.currentLayerLabel);
    return currentSlide?.name || '';
  });

  /** @type {string} */
  nextSlideName;

  /** @type {string} */
  pendingSlideName;

  /** @type {boolean} */
  configured = false;

  /** @type {Map<Symbol, ( params: ListenerParams ) => void>} */
  onBeforeListeners = new Map();

  /** @type {Map<Symbol, ( params: ListenerParams ) => void>} */
  onShowListeners = new Map();

  /**
   * Initialize the presenter state and set up reactivity
   */
  constructor() {
    // this.#setupStageTransitions();

    let timeout;

    $effect((slideLoadingPromise) => {
      if (this.isSlideLoading) {
        // Enable spinner after a short delay
        clearTimeout(timeout);
        setTimeout(() => {
          untrack(() => {
            if (this.isSlideLoading) {
              this.loadingSpinner = true;
            } else {
              this.loadingSpinner = false;
            }
          });
        }, 500);
      } else {
        this.loadingSpinner = false;
      }
    });
  }

  /**
   * Set up reactivity for stage transitions between the before/after states
   * This handles the animation timing for both layers
   */
  // #setupStageTransitions() {
  //   // Handle layer A stage transitions
  //   $effect(() => {
  //     if (this.layerA.stageBeforeIn || this.layerA.stageBeforeOut) {
  //       this.layerA = this.#processStageTransition(this.layerA);
  //     }
  //   });

  //   // Handle layer B stage transitions
  //   $effect(() => {
  //     if (this.layerB.stageBeforeIn || this.layerB.stageBeforeOut) {
  //       this.layerB = this.#processStageTransition(this.layerB);
  //     }
  //   });
  // }

  /**
   * Process a single stage transition for a layer
   *
   * @param {Layer} layer - The layer to process
   * @returns {Layer} - The updated layer with new stage
   */
  #processStageTransition(layer) {
    const updatedLayer = { ...layer };

    if (updatedLayer.stageBeforeIn) {
      delete updatedLayer.stageBeforeIn;
      updatedLayer.stageIn = true;
    } else if (updatedLayer.stageBeforeOut) {
      delete updatedLayer.stageBeforeOut;
      updatedLayer.stageOut = true;
    }

    return updatedLayer;
  }

  /**
   * Waiting for all transition timing promises to finish,
   * this should be the same amount of time as it takes for the real
   * transitions to finish
   *
   * @param {HkPromise[]} promises
   *   Array of transition promises to wait for
   */
  async #waitForTransitionPromises(promises) {
    try {
      // console.debug('waitForTransitionPromises', promises);

      await Promise.allSettled(promises);

      // console.debug('waitForTransitionPromises:done', promises);

      untrack(() => {
        this.#completeTransition();
      });
    } catch (error) {
      console.log('transition promises cancelled', error);
    }
  }

  /**
   * Complete the transition by updating layers and swapping them
   */
  #completeTransition() {
    // Hide current layer and set stage to AFTER
    this.#updateLayer(this.currentLayerLabel, {
      z: Z_BACK,
      visible: false,
      stageAfter: true
    });

    // Set next layer stage to SHOW
    this.#updateLayer(this.nextLayerLabel, {
      z: Z_FRONT,
      visible: true,
      stageShow: true
    });

    // Remove slide from current layer
    this.#updateSlide(this.currentLayerLabel, null);

    // Swap current and next layer labels
    this.#swapLayers();
  }

  /**
   * Swap the current and next layer labels
   */
  #swapLayers() {
    if (this.currentLayerLabel === LABEL_A) {
      this.currentLayerLabel = LABEL_B;
      this.nextLayerLabel = LABEL_A;
    } else {
      this.currentLayerLabel = LABEL_A;
      this.nextLayerLabel = LABEL_B;
    }
  }

  /**
   * Configure the presentation
   *
   * @param {object} _
   * @param {Slide[]} [_.slides] - Array of slides for the presentation
   */
  configure({ slides }) {
    this.configured = true;

    if (slides) {
      // Only update slides if provided
      this.slides = slides;
    }
  }

  /**
   * Configure the presentation slides
   *
   * @param {Slide[]} slides - Array of slides for the presentation
   */
  configureSlides(slides) {
    this.slides = slides ?? [];
  }

  /**
   * Transition to another slide by name
   *
   * @param {string} name - Name of the slide to transition to
   */
  async gotoSlide(name) {
    // throw new Error('gotoSlide');

    untrack(() => {
      const slide = findFirst(this.slides, { name });

      if (!slide) {
        console.log('available slides', this.slides);
        throw new Error(`Slide [${name}] has not been defined`);
      }

      this.#gotoSlide(slide);
    });
  }

  /**
   * Internal method to transition to another slide
   *
   * @param {Slide} slide - The slide to transition to
   */
  async #gotoSlide(slide) {
    if (!this.configured) {
      throw new Error('Not configured yet');
    }

    if (slide.name === this.currentSlideName) {
      //throw new Error(`gotoSlide cannot transition to current slide`);
      console.error(`gotoSlide cannot transition to current slide`);
      return;
    }

    this.nextSlideName = slide.name;

    if (this.busy) {
      this.pendingSlideName = slide.name;
      return;
    }

    this.#callOnBeforeListeners();

    this.slideLoadingPromise = null;

    // Get a presenter reference to pass to the slide
    const presenterRef = this.getPresenterRef();

    // Create a copy of the slide to avoid mutating the original
    const slideWithProps = {
      ...slide,
      data: {
        ...slide.data,
        props: {
          ...(slide.data.props || {}),
          getLoadingController: () => {
            this.isSlideLoading = true;
            this.slideLoadingPromise = new HkPromise(() => {});

            return this.#getLoadingController();
            // this.slideLoadingPromise should be a HkPromise now
            // console.log('slideLoadingPromise', this.slideLoadingPromise);
          },
          presenter: presenterRef // Add presenter reference to props
        }
      }
    };

    // console.debug('Checkpoint 1');

    // Add next slide to next layer
    this.#updateSlide(this.nextLayerLabel, slideWithProps);

    // console.debug('Checkpoint 2');

    await tick();

    // console.debug('Checkpoint 3');

    if (this.slideLoadingPromise) {
      // console.debug('Waiting for slide to load');
      // @ts-ignore
      await this.slideLoadingPromise;
      this.isSlideLoading = false;
      // console.debug('Done waiting for slide loading');
    }

    const currentSlide = this.#getSlide(this.currentLayerLabel);
    const nextSlide = this.#getSlide(this.nextLayerLabel);

    // console.debug('Checkpoint 4', currentSlide, nextSlide);

    // Make next layer visible, move to front, and prepare for
    // transition in
    this.#updateLayer(this.nextLayerLabel, {
      z: Z_FRONT,
      visible: true,
      stageBeforeIn: true,
      transitions: nextSlide?.intro ?? []
    });

    // Move current layer to back, keep visible, and prepare for
    // transition out
    this.#updateLayer(this.currentLayerLabel, {
      z: Z_BACK,
      visible: true,
      stageBeforeOut: true,
      transitions: currentSlide?.outro ?? []
    });

    // console.debug('Checkpoint 5');

    // Wait briefly to ensure the stageBeforeIn/stageBeforeOut states are rendered
    await tick();

    // Now manually process the transitions for both layers
    const layerA = this.layerA;
    const layerB = this.layerB;

    // Process stageBeforeIn transition for both layers
    if (layerA.stageBeforeIn) {
      this.layerA = this.#processStageTransition(layerA);
    }

    if (layerB.stageBeforeIn) {
      this.layerB = this.#processStageTransition(layerB);
    }

    // Wait for another tick to ensure the stageIn states are rendered
    await tick();

    // Process stageBeforeOut transition for both layers
    if (layerA.stageBeforeOut) {
      this.layerA = this.#processStageTransition(layerA);
    }

    if (layerB.stageBeforeOut) {
      this.layerB = this.#processStageTransition(layerB);
    }

    // console.debug('Checkpoint 7');

    // Start transitions
    this.#createTransitionPromises();

    // console.debug('Checkpoint 8');

    await this.#waitForTransitionPromises(this.transitionPromises);

    // Check if there's a pending slide transition
    if (this.pendingSlideName) {
      const pendingName = this.pendingSlideName;

      this.nextSlideName = pendingName;
      this.pendingSlideName = null;

      untrack(() => {
        if (pendingName !== this.currentSlideName) {
          this.gotoSlide(pendingName);
        }
      });
    } else {
      this.nextSlideName = null;
    }

    this.#callOnShowListeners();
  }

  #callOnBeforeListeners() {
    let nextSlideName = this.nextSlideName;

    for (const fn of this.onBeforeListeners.values()) {
      fn({ stage: STAGE_BEFORE, slideName: nextSlideName });
    }
  }

  #callOnShowListeners() {
    let currentSlideName = this.currentSlideName;

    for (const fn of this.onShowListeners.values()) {
      fn({ stage: STAGE_SHOW, slideName: currentSlideName });
    }
  }

  /**
   * Create transition promises that can be used to determine the timing
   * of the transitions between current and next slide
   */
  #createTransitionPromises() {
    // Cancel existing transitions
    let transitionPromises = this.transitionPromises;

    for (const current of transitionPromises) {
      current.tryCancel();
    }

    // Start new transitions
    transitionPromises = [];

    const currentSlide = this.#getSlide(this.currentLayerLabel);
    const nextSlide = this.#getSlide(this.nextLayerLabel);

    // Apply transitions `out` from currentslide
    const transitionsOut = currentSlide?.outro;

    // console.log('transitionsOut', transitionsOut);

    if (transitionsOut) {
      for (const transition of transitionsOut) {
        const promise = this.#createTransitionPromise(transition);
        transitionPromises.push(promise);
      }
    }

    // Apply transitions `in` from next slide
    const transitionsIn = nextSlide?.intro;

    // console.log('transitionsIn', transitionsIn);

    if (transitionsIn) {
      for (const transition of transitionsIn) {
        const promise = this.#createTransitionPromise(transition);
        transitionPromises.push(promise);
      }
    }

    this.transitionPromises = transitionPromises;
  }

  /**
   * Create a transition promise for the specified transition
   *
   *
   * @param {Transition} transition - The transition to apply
   *
   * @returns {HkPromise}
   *   Promise that resolves after the same amount of time that it
   *   takes for the transition to finish
   */
  #createTransitionPromise(transition) {
    const delay = (transition.delay ?? 0) + (transition.duration ?? 0);

    if (0 === delay) {
      const promise = new HkPromise(() => {});
      promise.resolve(true);
      return promise;
    }

    let promise = new HkPromise((/** @type {function} */ resolve) => {
      if (delay) {
        setTimeout(() => {
          resolve(true);
        }, delay);
      }
    });

    return promise;
  }

  /**
   * Get slide by layer label
   *
   * @param {string} label - Layer label (A or B)
   * @returns {Slide|null} The slide for the specified layer or null
   */
  #getSlide(label) {
    if (label === LABEL_A) {
      return this.slideA;
    }

    if (label === LABEL_B) {
      return this.slideB;
    }

    return null;
  }

  /**
   * Update layer by label
   *
   * @param {string} label - Layer label (A or B)
   * @param {Layer} data - Layer data to update
   */
  #updateLayer(label, data) {
    if (label === LABEL_A) {
      this.layerA = data;
      return;
    }

    if (label === LABEL_B) {
      this.layerB = data;
      return;
    }

    throw new Error(`Missing layer [${label}]`);
  }

  /**
   * Update slide by label
   *
   * @param {string} label - Layer label (A or B)
   * @param {Slide|null} data - Slide data to update or null to clear
   */
  #updateSlide(label, data) {
    if (label === LABEL_A) {
      this.slideA = data;
      return;
    }

    if (label === LABEL_B) {
      this.slideB = data;
      return;
    }

    throw new Error(`Missing slide [${label}]`);
  }

  /**
   * Returns a simplified presenter reference with essential methods
   * for slide components to use
   *
   * @returns {PresenterRef} A reference object with presenter methods
   */
  getPresenterRef() {
    return {
      gotoSlide: (name) => this.gotoSlide(name),
      getCurrentSlideName: () => this.currentSlideName,
      onBefore: (callback) => {
        const key = Symbol();
        this.onBeforeListeners.set(key, callback);

        return () => {
          this.onBeforeListeners.delete(key);
        };
      },
      onShow: (callback) => {
        const key = Symbol();
        this.onShowListeners.set(key, callback);

        return () => {
          this.onShowListeners.delete(key);
        };
      }
    };
  }

  /**
   * Returns a controller object for managing manual loading
   * Components can use this to signal when they're done loading
   * or to cancel and go back to the previous slide
   *
   * @returns {LoadController}
   *  Object with loaded() and cancel() methods
   */
  #getLoadingController() {
    // console.debug('getLoadingController was called');

    return {
      /**
       * Call when component has finished loading
       */
      loaded: () => {
        // console.debug('Slide said loading has completed');
        this.slideLoadingPromise?.tryResolve();
      },

      /**
       * Call to cancel loading and return to previous slide
       */
      cancel: () => {
        // console.debug('Slide said loading has cancelled');
        this.slideLoadingPromise?.tryReject();
      }
    };
  }
}
