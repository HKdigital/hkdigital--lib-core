import { tick } from 'svelte';

import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

import { findFirst } from '$lib/util/array/index.js';

import { untrack } from 'svelte';

import { HkPromise } from '$lib/classes/promise/index.js';

/* ----------------------------------------------------------------- typedefs */

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
 * @typedef {Object} LoadController
 * @property {() => void} loaded - Function to call when loading is complete
 * @property {() => void} cancel - Function to return to the previous slide
 */

/**
 * @typedef {Object} PresenterRef
 * @property {(name: string) => void} gotoSlide - Navigate to a slide by name
 * @property {() => string} getCurrentSlideName - Get the current slide name
 */

/* -------------------------------------------------------------- Constants */

const Z_BACK = 0;
const Z_FRONT = 10;

const LABEL_A = 'A';
const LABEL_B = 'B';

/* ------------------------------------------------------- Define state class */

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
  pendingSlideName;

  /**
   * Initialize the presenter state and set up reactivity
   */
  constructor() {
    this.#setupStageTransitions();

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
  #setupStageTransitions() {
    // Handle layer A stage transitions
    $effect(() => {
      if (this.layerA.stageBeforeIn || this.layerA.stageBeforeOut) {
        this.layerA = this.#processStageTransition(this.layerA);
      }
    });

    // Handle layer B stage transitions
    $effect(() => {
      if (this.layerB.stageBeforeIn || this.layerB.stageBeforeOut) {
        this.layerB = this.#processStageTransition(this.layerB);
      }
    });
  }

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

  // /**
  //  * Set up reactivity for tracking transition promises
  //  * This handles the completion of animations and layer swapping
  //  */
  // #setupTransitionTracking() {
  //   $effect(() => {
  //     const promises = this.transitionPromises;

  //     if (promises.length > 0) {
  //       const nextSlide = this.#getSlide(this.nextLayerLabel);

  //       if (!nextSlide) {
  //         return;
  //       }

  //       untrack(() => {
  //         this.#executeTransition(promises);
  //       });
  //     }
  //   });
  // }

  /**
   * Execute the transition by waiting for all promises and then
   * completing the transition
   *
   * @param {HkPromise[]} promises - Array of transition promises to wait for
   */
  async #executeTransition(promises) {
    try {
      // console.debug('executeTransition');

      await Promise.allSettled(promises);

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
   * @param {boolean} [_.autostart=false] - Whether to start automatically
   * @param {string} [_.startSlide] - Name of the slide to start with
   * @param {Slide[]} [_.slides] - Array of slides for the presentation
   */
  configure({ slides, autostart = true, startSlide }) {
    untrack(() => {
      if (slides) {
        // Only update slides if provided
        this.slides = slides;
      }

      if ((autostart || startSlide) && this.slides?.length) {
        if (startSlide) {
          this.gotoSlide(startSlide);
        } else {
          this.#gotoSlide(this.slides[0]);
        }
      }
    });
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
    if (this.busy) {
      this.pendingSlideName = slide.name;
      return;
    }

    this.slideLoadingPromise = null;

    // Get a presenter reference to pass to the slide
    const presenterRef = this.#getPresenterRef();

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

    // console.debug('Checkpoint 4');

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

    // Start transitions
    this.#applyTransitions();

    await this.#executeTransition(this.transitionPromises);

    // Check if there's a pending slide transition
    if (this.pendingSlideName) {
      const pendingName = this.pendingSlideName;

      this.pendingSlideName = null;

      untrack(() => {
        if (pendingName !== this.currentSlideName) {
          this.gotoSlide(pendingName);
        }
      });
    }
  }

  /**
   * Apply transitions between current and next slide
   */
  #applyTransitions() {
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

    if (transitionsOut) {
      for (const transition of transitionsOut) {
        const promise = this.#applyTransition(transition);
        transitionPromises.push(promise);
      }
    }

    // Apply transitions `in` from next slide
    const transitionsIn = nextSlide?.intro;

    if (transitionsIn) {
      for (const transition of transitionsIn) {
        const promise = this.#applyTransition(transition);
        transitionPromises.push(promise);
      }
    }

    this.transitionPromises = transitionPromises;
  }

  /**
   * Apply a transition and return a transition promise
   *
   * @param {Transition} transition - The transition to apply
   * @returns {HkPromise} Promise that resolves when transition completes
   */
  #applyTransition(transition) {
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
  #getPresenterRef() {
    return {
      gotoSlide: (name) => this.gotoSlide(name),
      getCurrentSlideName: () => this.currentSlideName
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

/* -------------------------------------- Export create & get state functions */

export const [createOrGetState, createState, getState] =
  defineStateContext(PresenterState);
