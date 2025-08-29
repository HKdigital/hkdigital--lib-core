/**
 * @fileoverview Type definitions for FiniteStateMachine
 */

/**
 * Metadata object passed to state transition callbacks
 *
 * @typedef {object} StateTransitionMetadata
 * @property {string} from - The state being exited
 * @property {string} to - The state being entered
 * @property {string} event - The event that triggered the transition
 * @property {any[]} args - Arguments passed to the send() method
 */

/**
 * Callback function called when entering a state
 *
 * @typedef {function(string, StateTransitionMetadata): void} OnEnterCallback
 */

/**
 * Callback function called when exiting a state
 *
 * @typedef {function(string, StateTransitionMetadata): void} OnExitCallback
 */

// Export types for external use (this is just for JSDoc, no actual exports needed)
export {};
