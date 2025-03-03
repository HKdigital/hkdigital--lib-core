//import { FiniteStateMachine } from 'runed';

import { FiniteStateMachine } from '$lib/classes/svkit/final-state-machine/index.js';

import {
  // > States
  STATE_INITIAL,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_LOADED,
  STATE_CANCELLED,
  STATE_ERROR,

  // > Signals
  INITIAL,
  LOAD,
  CANCEL,
  ERROR,
  LOADED,
  UNLOAD
} from './constants.js';

/**
 * extends FiniteStateMachine<StatesT, EventsT>
 */
export default class LoadingStateMachine extends FiniteStateMachine {
  // Inherited from parent class (getter)
  // current = $state(<string>)

  /** @type {Error|null} */
  #error = null;

  /** @type {(( state: string )=>void)|null} */
  onenter = null;

  constructor() {
    let superCalled = false;
    super(STATE_INITIAL, {
      [STATE_INITIAL]: {
        _enter: () => {
          if (superCalled) {
            this.onenter?.(STATE_INITIAL);
          }
          superCalled = true;
        },
        [LOAD]: STATE_LOADING
      },
      [STATE_LOADING]: {
        _enter: () => {
          // console.log('LoadingStateMachine: enter LOADING');
          this.onenter?.(STATE_LOADING);
        },
        [CANCEL]: STATE_CANCELLED,
        [ERROR]: STATE_ERROR,
        [LOADED]: STATE_LOADED
      },
      [STATE_LOADED]: {
        _enter: () => {
          // console.log('LoadingStateMachine: enter LOADED');
          this.onenter?.(STATE_LOADED);
        },
        [LOAD]: STATE_LOADING,
        [UNLOAD]: STATE_UNLOADING
      },
      [STATE_UNLOADING]: {
        _enter: () => {
          this.onenter?.(STATE_UNLOADING);
        },
        [ERROR]: STATE_ERROR,
        [INITIAL]: STATE_INITIAL
      },
      [STATE_CANCELLED]: {
        _enter: () => {
          this.onenter?.(STATE_CANCELLED);
        },
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

          this.onenter?.(STATE_CANCELLED);
        },
        _leave: () => {
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
}
