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
