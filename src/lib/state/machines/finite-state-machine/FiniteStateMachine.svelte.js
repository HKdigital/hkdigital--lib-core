/**
 * Initial code borrowed from:
 *
 * @see {@link https://runed.dev/docs/utilities/finite-state-machine}
 */

import { isTestEnv } from '$lib/util/env.js';
import EventEmitter from '$lib/generic/events/classes/EventEmitter.js';
import { ENTER, EXIT } from './constants.js';

/** @typedef {import('./typedef.js').StateTransitionMetadata} StateTransitionMetadata */
/** @typedef {import('./typedef.js').OnEnterCallback} OnEnterCallback */
/** @typedef {import('./typedef.js').OnExitCallback} OnExitCallback */

/**
 * Check if the value is valid meta data
 *
 * @param {any} meta
 */
export function isLifecycleFnMeta(meta) {
  return (
    !!meta &&
    typeof meta === 'object' &&
    'to' in meta &&
    'from' in meta &&
    'event' in meta &&
    'args' in meta
  );
}

/**
 * Defines a Finite State Machine that extends EventEmitter
 */
export default class FiniteStateMachine extends EventEmitter {
  #current = $state();
  states;
  #timeout = {};

  /** @type {OnEnterCallback | null} */
  onenter = null;

  /** @type {OnExitCallback | null} */
  onexit = null;

  /** @type {boolean} */
  #enableConsoleWarnings = !isTestEnv;

  /**
   * Constructor
   *
   * @param {string} initial
   * @param {{ [key: string]: { [key: string]: (string|((...args: any[])=>void)) } }} states
   */
  constructor(initial, states) {
    super();
    this.#current = initial;
    this.states = states;

    // synthetically trigger _enter for the initial state.
    const initialMetadata = {
      from: null,
      to: initial,
      event: null,
      args: []
    };

    this.#executeAction('_enter', initialMetadata);

    // Emit ENTER event for external listeners for initial state
    this.emit(ENTER, { state: initial, metadata: initialMetadata });
  }

  /**
   * Transition to new state
   *
   * @param {string} newState
   * @param {string} event
   * @param {any[]} [args]
   */
  #transition(newState, event, args) {
    /** @type {StateTransitionMetadata} */
    const metadata = { from: this.#current, to: newState, event, args };

    // Call onexit callback before leaving current state
    this.onexit?.(this.#current, metadata);

    // Emit EXIT event for external listeners
    this.emit(EXIT, { state: this.#current, metadata });

    this.#executeAction('_exit', metadata);
    this.#current = newState;
    this.#executeAction('_enter', metadata);

    // Emit ENTER event for external listeners
    this.emit(ENTER, { state: newState, metadata });

    // Call onenter callback after state change
    this.onenter?.(newState, metadata);
  }

  /**
   * Execute an action for the given event
   *
   * @param {string} event
   * @param {any} args
   */
  #executeAction(event, ...args) {
    const action =
      this.states[this.#current]?.[event] ?? this.states['*']?.[event];

    if (action instanceof Function) {
      switch (event) {
        // Internal lifecycle events
        case ENTER:
        case EXIT:
          if (isLifecycleFnMeta(args[0])) {
            return action(args[0]);
          } else {
            throw new Error(`Invalid metadata passed to lifecycle function`);
          }

        // Normal state events
        default:
          return action(...args);
      }
    } else if (typeof action === 'string') {
      // No function execution => just return target state
      return action;
    } else {
      // No action found - only warn for non-lifecycle events
      if (event !== ENTER && event !== EXIT) {
        if (this.#enableConsoleWarnings) {
          console.warn(
            'No action defined for event',
            event,
            'in state',
            this.#current
          );
        }
      }
    }
  }
  /**
   * Triggers a new event and returns the new state.
   *
   * @param {string} event
   * @param {any[]} args
   */
  send(event, ...args) {
    const newState = this.#executeAction(event, ...args);

    if (newState && newState !== this.#current) {
      this.#transition(newState, event, args);
    }

    return this.#current;
  }
  /**
   * Debounces the triggering of an event.
   *
   * @param {number} wait
   * @param {string} event
   * @param {any[]} args
   */
  async debounce(wait = 500, event, ...args) {
    if (this.#timeout[event]) {
      clearTimeout(this.#timeout[event]);
    }
    return new Promise((resolve) => {
      this.#timeout[event] = setTimeout(() => {
        delete this.#timeout[event];
        resolve(this.send(event, ...args));
      }, wait);
    });
  }

  /** The current state. */
  get current() {
    return this.#current;
  }
}
