/**
 * @fileoverview Type definitions for ServiceBase class.
 *
 * This file contains all TypeScript/JSDoc type definitions used by
 * the ServiceBase class and service implementations.
 *
 * @example
 * // In your service implementation
 * import { ServiceBase } from './ServiceBase.js';
 *
 * class MyService extends ServiceBase {
 *   async _configure(newConfig, oldConfig) {
 *   }
 *
 *   async _healthCheck() {
 *     // Return type is HealthStatus
 *     return { latency: 10 };
 *   }
 * }
 */

// ============================================================================
// PUBLIC TYPES
// ============================================================================

/**
 * Result of a service operation
 *
 * @typedef {Object} OperationResult
 * @property {boolean} ok - Whether the operation succeeded
 * @property {Error} [error] - Error details if operation failed
 */

/**
 * All possible service states during lifecycle management
 *
 * @typedef {import('./constants.js').STATE_NOT_CREATED |
 *           import('./constants.js').STATE_CREATED |
 *           import('./constants.js').STATE_CONFIGURING |
 *           import('./constants.js').STATE_CONFIGURED |
 *           import('./constants.js').STATE_STARTING |
 *           import('./constants.js').STATE_RUNNING |
 *           import('./constants.js').STATE_STOPPING |
 *           import('./constants.js').STATE_STOPPED |
 *           import('./constants.js').STATE_DESTROYING |
 *           import('./constants.js').STATE_DESTROYED |
 *           import('./constants.js').STATE_ERROR |
 *           import('./constants.js').STATE_RECOVERING
 * } ServiceState
 */

/**
 * Options for creating a service instance
 *
 * @typedef {Object} ServiceOptions
 * @property {() => import('../service-manager/ServiceManager.js').default} getManager - Function to get manager instance
 * @property {<T>(serviceName: string) => T} getService - Bound getService function
 * @property {import('$lib/logging/typedef.js').LogLevel} [logLevel] - Initial log level for the service
 * @property {number} [shutdownTimeout=5000] - Timeout for graceful shutdown
 */

/**
 * Options for stopping a service
 *
 * @typedef {Object} StopOptions
 * @property {number} [timeout] - Override shutdown timeout
 * @property {boolean} [force=false] - Force stop even if timeout exceeded
 */

/**
 * Health status returned by service health checks
 *
 * @typedef {Object} HealthStatus
 * @property {string} name - Service name
 * @property {string} state - Current service state
 * @property {boolean} healthy - Whether the service is healthy
 * @property {string} [error] - Error message if unhealthy
 * @property {string} [checkError] - Error from health check itself
 * @property {*} [key] - Additional health check properties
 */

/**
 * Base class interface that services must implement
 * Allows additional custom properties and methods via Record<string, any>
 *
 * @typedef {Object & Record<string, any>} ServiceInstance
 * @property {string} name - Service name
 * @property {ServiceState} state - Current state
 * @property {boolean} healthy - Health status
 * @property {Error|null} error - Last error
 * @property {import('$lib/logging/common.js').Logger} logger - Service logger
 * @property {(config?: *) => Promise<boolean>} configure
 * @property {() => Promise<boolean>} start
 * @property {(options?: StopOptions) => Promise<boolean>} stop
 * @property {() => Promise<boolean>} recover
 * @property {() => Promise<boolean>} destroy
 * @property {() => Promise<HealthStatus>} getHealth
 * @property {(level: string) => boolean} setLogLevel
 * @property {(event: string, handler: Function) => Function} on
 * @property {(event: string, data: any) => boolean} emit
 */

// ============================================================================
// INTERNAL TYPES
// ============================================================================

/**
 * @typedef {Object} StateChangeEvent
 * @property {string} service - Service name (added by ServiceManager)
 * @property {ServiceState} oldState - Previous state
 * @property {ServiceState} newState - New state
 */

/**
 * @typedef {Object} TargetStateChangeEvent
 * @property {ServiceState} oldTargetState - Previous target state
 * @property {ServiceState} newTargetState - New target state
 */

/**
 * @typedef {Object} HealthChangeEvent
 * @property {boolean} healthy - Current health status
 * @property {boolean} [wasHealthy] - Previous health status
 */

/**
 * Event emitted when service encounters an error
 *
 * @typedef {Object} ServiceErrorEvent
 * @property {string} operation - Operation that failed
 * @property {Error} error - Error that occurred
 */

export {};
