/**
 * Initial code borrowed from:
 *
 * @see {@link https://runed.dev/docs/utilities/finite-state-machine}
 */

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
 * Defines a Finite State Machine
 */
export default class FiniteStateMachine {
  #current = $state();
  states;
  #timeout = {};

  /**
   * Constructor
   *
   * @param {string} initial
   * @param {{ [key: string]: { [key: string]: (string|((...args: any[])=>void)) } }} states
   */
  constructor(initial, states) {
    this.#current = initial;
    this.states = states;

    // synthetically trigger _enter for the initial state.
    this.#dispatch('_enter', {
      from: null,
      to: initial,
      event: null,
      args: []
    });
  }

  /**
   * Transition to new state
   *
   * @param {string} newState
   * @param {string} event
   * @param {any[]} [args]
   */
  #transition(newState, event, args) {
    const metadata = { from: this.#current, to: newState, event, args };
    this.#dispatch('_exit', metadata);
    this.#current = newState;
    this.#dispatch('_enter', metadata);
  }

  /**
   * Dispatch an event
   *
   * @param {string} event
   * @param {any[]} args
   */
  #dispatch(event, ...args) {
    const action =
      this.states[this.#current]?.[event] ?? this.states['*']?.[event];
    if (action instanceof Function) {
      if (event === '_enter' || event === '_exit') {
        if (isLifecycleFnMeta(args[0])) {
          action(args[0]);
        } else {
          console.warn(
            'Invalid metadata passed to lifecycle function of the FSM.'
          );
        }
      } else {
        return action(...args);
      }
    } else if (typeof action === 'string') {
      return action;
    } else if (event !== '_enter' && event !== '_exit') {
      console.warn(
        'No action defined for event',
        event,
        'in state',
        this.#current
      );
    }
  }
  /**
   * Triggers a new event and returns the new state.
   *
   * @param {string} event
   * @param {any[]} args
   */
  send(event, ...args) {
    const newState = this.#dispatch(event, ...args);
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
