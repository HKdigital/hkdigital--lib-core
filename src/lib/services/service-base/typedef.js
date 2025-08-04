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
 *   async _init(config) {
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
 * Options for creating a service instance
 *
 * @typedef {Object} ServiceOptions
 * @property {string} [logLevel] - Initial log level for the service
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
 *
 * @typedef {Object} ServiceInstance
 * @property {string} name - Service name
 * @property {string} state - Current state
 * @property {boolean} healthy - Health status
 * @property {Error|null} error - Last error
 * @property {import('$lib/logging/internal/unified-logger').Logger} logger - Service logger
 * @property {(config?: *) => Promise<boolean>} initialize
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
 * @property {string} oldState - Previous state
 * @property {string} newState - New state
 */

/**
 * @typedef {Object} HealthChangeEvent
 * @property {string} service - Service name (added by ServiceManager)
 * @property {boolean} healthy - Current health status
 * @property {boolean} [wasHealthy] - Previous health status
 */

/**
 * Event emitted when service encounters an error
 *
 * @typedef {Object} ServiceErrorEvent
 * @property {string} service - Service name
 * @property {string} operation - Operation that failed
 * @property {Error} error - Error that occurred
 */

export {};
