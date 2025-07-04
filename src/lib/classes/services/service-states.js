/**
 * @fileoverview Service state constants for the service management system.
 *
 * Defines all possible states a service can be in during its lifecycle.
 * Services transition through these states as they are initialized, started,
 * stopped, and handle errors or recovery.
 *
 * @example
 * // Using state constants in a service
 * import { RUNNING, ERROR } from './service-states.js';
 *
 * class MyService extends ServiceBase {
 *   async doWork() {
 *     if (this.state !== RUNNING) {
 *       throw new Error('Service not running');
 *     }
 *     // ... do work
 *   }
 * }
 *
 * @example
 * // Checking service states
 * import { RUNNING, ERROR, STOPPED } from './service-states.js';
 *
 * const service = serviceManager.get('database');
 *
 * switch (service.state) {
 *   case RUNNING:
 *     console.log('Service is operational');
 *     break;
 *   case ERROR:
 *     console.log('Service has failed');
 *     break;
 *   case STOPPED:
 *     console.log('Service is stopped');
 *     break;
 * }
 */

/**
 * Service has not been created yet
 * @const {string}
 */
export const NOT_CREATED = 'not-created';

/**
 * Service has been created but not initialized
 * @const {string}
 */
export const CREATED = 'created';

/**
 * Service is currently initializing
 * @const {string}
 */
export const INITIALIZING = 'initializing';

/**
 * Service has been initialized and is ready to start
 * @const {string}
 */
export const INITIALIZED = 'initialized';

/**
 * Service is currently starting up
 * @const {string}
 */
export const STARTING = 'starting';

/**
 * Service is running and operational
 * @const {string}
 */
export const RUNNING = 'running';

/**
 * Service is currently shutting down
 * @const {string}
 */
export const STOPPING = 'stopping';

/**
 * Service has been stopped
 * @const {string}
 */
export const STOPPED = 'stopped';

/**
 * Service is being destroyed and cleaned up
 * @const {string}
 */
export const DESTROYING = 'destroying';

/**
 * Service has been destroyed and cannot be used
 * @const {string}
 */
export const DESTROYED = 'destroyed';

/**
 * Service encountered an error and is not operational
 * @const {string}
 */
export const ERROR = 'error';

/**
 * Service is attempting to recover from an error
 * @const {string}
 */
export const RECOVERING = 'recovering';

/**
 * Valid state transitions map
 * Maps each state to the states it can transition to
 * @const {Object<string, string[]>}
 */
export const VALID_TRANSITIONS = {
  [CREATED]: [INITIALIZING, DESTROYING],
  [INITIALIZING]: [INITIALIZED, ERROR, DESTROYING],
  [INITIALIZED]: [STARTING, DESTROYING],
  [STARTING]: [RUNNING, ERROR, STOPPING],
  [RUNNING]: [STOPPING, ERROR],
  [STOPPING]: [STOPPED, ERROR],
  [STOPPED]: [STARTING, DESTROYING, INITIALIZING],
  [DESTROYING]: [DESTROYED, ERROR],
  [DESTROYED]: [CREATED], // Can be recreated
  [ERROR]: [RECOVERING, STOPPING, DESTROYING],
  [RECOVERING]: [RUNNING, STOPPED, ERROR]
};

/**
 * States that indicate the service is operational
 * @const {string[]}
 */
export const OPERATIONAL_STATES = [RUNNING];

/**
 * States that indicate the service is transitioning
 * @const {string[]}
 */
export const TRANSITIONAL_STATES = [
  INITIALIZING,
  STARTING,
  STOPPING,
  DESTROYING,
  RECOVERING
];

/**
 * States that indicate the service is not operational
 * @const {string[]}
 */
export const INACTIVE_STATES = [
  CREATED,
  INITIALIZED,
  STOPPED,
  DESTROYED,
  ERROR
];

/**
 * Check if a state transition is valid
 *
 * @param {string} fromState - Current state
 * @param {string} toState - Desired state
 *
 * @returns {boolean} True if transition is valid
 */
export function isValidTransition(fromState, toState) {
  const validStates = VALID_TRANSITIONS[fromState];
  return validStates ? validStates.includes(toState) : false;
}

/**
 * Check if a service is in an operational state
 *
 * @param {string} state - Current state
 *
 * @returns {boolean} True if operational
 */
export function isOperational(state) {
  return OPERATIONAL_STATES.includes(state);
}

/**
 * Check if a service is in a transitional state
 *
 * @param {string} state - Current state
 *
 * @returns {boolean} True if transitioning
 */
export function isTransitioning(state) {
  return TRANSITIONAL_STATES.includes(state);
}

/**
 * Check if a service is in an inactive state
 *
 * @param {string} state - Current state
 *
 * @returns {boolean} True if inactive
 */
export function isInactive(state) {
  return INACTIVE_STATES.includes(state);
}
