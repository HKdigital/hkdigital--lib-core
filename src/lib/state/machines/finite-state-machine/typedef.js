/**
 * @fileoverview Type definitions for FiniteStateMachine
 */

/**
 * Metadata object passed to state transition callbacks
 *
 * @typedef {object} TransitionData
 * @property {string} from - The state being exited
 * @property {string} to - The state being entered
 * @property {string} event - The event that triggered the transition
 * @property {any[]} args - Arguments passed to the send() method
 */

  /**
   * Callback function called when entering a state
   *
   * @callback OnEnterCallback
   * @param {string} currentState - The state being entered
   * @param {TransitionData} transition - Details about the transition
   * @returns {void}
   */

  /**
   * Callback function called when exiting a state
   *
   * @callback OnExitCallback
   * @param {string} currentState - The state being exited
   * @param {TransitionData} transition - Details about the transition
   * @returns {void}
   */

// Export types for JSdoc
export {};
