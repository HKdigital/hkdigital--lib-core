import { setContext, getContext, hasContext } from 'svelte';

/* ----------------------------------------------------------- Create and Get */

/**
 * Define a state context:
 * - Returns a function 'createOrGetState' that can be used to create a new state
 *   or get an existing one
 * - Returns a function 'createState' that can be used to create a new state
 *
 * @template T
 *
 * @param {new() => T} State - Class that can be used to construct the state
 *
 * @returns {[
 *   createOrGetState,
 *   createState,
 *   getState
 * ]}
 */
export function defineStateContext(State) {
  const description = State.name;

  const sharedKey = Symbol(description);

  /**
   * Create component state
   *
   * @param {string|Symbol} [instanceKey]
   *
   * @returns {T} state
   */
  function createState(instanceKey) {
    const key = instanceKey ?? sharedKey;

    // console.log('Create state', key);

    const state = new State();

    // @ts-ignore
    state._instanceKey = instanceKey;

    return setContext(key, state);
  }

  /**
   * Get component state or create a new state if it does not yet exist
   *
   * @param {string|Symbol} [instanceKey]
   *
   * @returns {T} state
   */
  function createOrGetState(instanceKey) {
    let key = instanceKey ?? sharedKey;

    if (!hasContext(key)) {
      return createState(key);
    }

    return getContext(key);
  }

  /**
   * Get component state
   *
   * @throws Will throw an error if the state-context does not exist
   *
   * @param {string|Symbol} [instanceKey]
   *
   * @returns {T} state
   */
  function getState(instanceKey) {
    let key = instanceKey ?? sharedKey;

    if (!hasContext(key)) {
      throw new Error(`No state context found. Create one first`);
    }

    return getContext(key);
  }

  return [createOrGetState, createState, getState];
}
