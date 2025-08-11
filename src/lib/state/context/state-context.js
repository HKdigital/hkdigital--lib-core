import { setContext, getContext, hasContext } from 'svelte';

export const DEFAULT_CONTEXT_KEY = 'default';

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
  const stateName = State.name;

  const sharedKey = Symbol(stateName);

  // console.debug(`Creating state context for ${stateName}`, { sharedKey });

  /**
   * Internal function to get the supplied key or the shared key
   *
   * @param {import('./typedef').ContextKey} [contextKey]
   *
   * @returns {Symbol} key
   */
  function getKey(contextKey) {
    if (typeof contextKey === 'symbol') {
      return contextKey;
    }

    if (
      contextKey === undefined ||
      contextKey === null ||
      contextKey === DEFAULT_CONTEXT_KEY
    ) {
      return sharedKey;
    }

    throw new Error(
      `Invalid contextKey (use a Symbol or DEFAULT_CONTEXT_KEY)`
    );
  }

  /**
   * Create component state
   *
   * @param {import('./typedef').ContextKey} [contextKey]
   *
   * @returns {T} state
   */
  function createState(contextKey) {
    const key = getKey(contextKey);

    // console.log('Create state', key);
    // console.debug(`Creating new state for ${stateName}`, {
    //   key,
    //   contextKey,
    //   isDefaultKey: key === sharedKey
    // });

    const state = new State();

    // @ts-ignore
    state._contextKey = contextKey;

    return setContext(key, state);
  }

  /**
   * Get component state or create a new state if it does not yet exist
   *
   * @param {import('./typedef').ContextKey} [contextKey]
   *
   * @returns {T} state
   */
  function createOrGetState(contextKey) {
    let key = getKey(contextKey);

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
   * @param {import('./typedef').ContextKey} [contextKey]
   *
   * @returns {T} state
   */
  function getState(contextKey) {
    let key = getKey(contextKey);

    if (!hasContext(key)) {
      throw new Error(`No state context found. Create one first`);
    }

    return getContext(key);
  }

  return [createOrGetState, createState, getState];
}
