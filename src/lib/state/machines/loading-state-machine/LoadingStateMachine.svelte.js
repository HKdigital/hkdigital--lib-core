//import { FiniteStateMachine } from 'runed';

import FiniteStateMachine from '../finite-state-machine/FiniteStateMachine.svelte.js';

import {
  // > States
  STATE_INITIAL,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_LOADED,
  STATE_CANCELLED,
  STATE_ERROR,
  STATE_TIMEOUT,

  // > Signals
  INITIAL,
  LOAD,
  CANCEL,
  ERROR,
  LOADED,
  UNLOAD,
  TIMEOUT
} from './constants.js';

/**
 * extends FiniteStateMachine<StatesT, EventsT>
 */
export default class LoadingStateMachine extends FiniteStateMachine {
  // Inherited from parent class (getter)
  // current = $state(<string>)

  /** @type {Error|null} */
  #error = null;

  constructor() {
    super(STATE_INITIAL, {
      [STATE_INITIAL]: {
        [LOAD]: STATE_LOADING
      },
      [STATE_LOADING]: {
        // _enter: () => {
        //   console.log('LoadingStateMachine: enter LOADING');
        // },
        [CANCEL]: STATE_CANCELLED,
        [ERROR]: STATE_ERROR,
        [LOADED]: STATE_LOADED,
        [TIMEOUT]: STATE_TIMEOUT
      },
      [STATE_LOADED]: {
        // _enter: () => {
        //   console.log('LoadingStateMachine: enter LOADED');
        // },
        [LOAD]: STATE_LOADING,
        [UNLOAD]: STATE_UNLOADING
      },
      [STATE_UNLOADING]: {
        [ERROR]: STATE_ERROR,
        [INITIAL]: STATE_INITIAL
      },
      [STATE_CANCELLED]: {
        [LOAD]: STATE_LOADING,
        [UNLOAD]: STATE_UNLOADING
      },
      [STATE_TIMEOUT]: {
        [LOAD]: STATE_LOADING,
        [UNLOAD]: STATE_UNLOADING
      },
      [STATE_ERROR]: {
        _enter: ({ /*from, to, event,*/ args }) => {
          if (args[0] instanceof Error) {
            this.#error = args[0];
          } else {
            const tmp = args[0]?.error;
            if (tmp instanceof Error) {
              this.#error = tmp;
            } else if (typeof tmp === 'string') {
              this.#error = new Error(tmp);
            } else {
              this.#error = new Error('The state machine entered STATE_ERROR');
            }
          }
        },
        _exit: () => {
          this.#error = null;
        },
        [LOAD]: STATE_LOADING,
        [UNLOAD]: STATE_UNLOADING
      }
    });
  }

  /** The last error */
  get error() {
    return this.#error;
  }

  /**
   * Transition to timeout state
   * - Only valid when currently loading
   * - Useful for external timeout management
   */
  doTimeout() {
    this.send(TIMEOUT);
  }

  /**
   * Transition to cancelled state
   * - Only valid when currently loading
   * - Useful for external cancellation management
   */
  doCancel() {
    this.send(CANCEL);
  }
}
