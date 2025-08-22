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

// ============================================================================
// STATE CONSTANTS
// ============================================================================

/**
 * Service has not been created yet
 */
export const STATE_NOT_CREATED = 'not-created';

/**
 * Service has been created but not initialized
 */
export const STATE_CREATED = 'created';

/**
 * Service is currently being configured
 */
export const STATE_CONFIGURING = 'configuring';

/**
 * Service has been configured and is ready to start
 */
export const STATE_CONFIGURED = 'configured';

/**
 * Service is currently starting up
 */
export const STATE_STARTING = 'starting';

/**
 * Service is running and operational
 */
export const STATE_RUNNING = 'running';

/**
 * Service is currently shutting down
 */
export const STATE_STOPPING = 'stopping';

/**
 * Service has been stopped
 */
export const STATE_STOPPED = 'stopped';

/**
 * Service is being destroyed and cleaned up
 */
export const STATE_DESTROYING = 'destroying';

/**
 * Service has been destroyed and cannot be used
 */
export const STATE_DESTROYED = 'destroyed';

/**
 * Service encountered an error and is not operational
 */
export const STATE_ERROR = 'error';

/**
 * Service is attempting to recover from an error
 */
export const STATE_RECOVERING = 'recovering';

// ============================================================================
// EVENT CONSTANTS
// ============================================================================

/**
 * Event emitted when service state changes
 */
export const EVENT_STATE_CHANGED = 'stateChanged';

/**
 * Event emitted when service target state changes
 */
export const EVENT_TARGET_STATE_CHANGED = 'targetStateChanged';

/**
 * Event emitted when service health status changes
 */
export const EVENT_HEALTH_CHANGED = 'healthChanged';

/**
 * Event emitted when service encounters an error
 */
export const EVENT_ERROR = 'error';

