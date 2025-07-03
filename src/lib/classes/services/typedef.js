/**
 * @fileoverview Type definitions for the service management system.
 * 
 * This file contains all TypeScript/JSDoc type definitions used throughout
 * the service management system. Import these types in your service
 * implementations and when using the ServiceManager.
 * 
 * @example
 * // In your service implementation
 * import { ServiceBase } from './ServiceBase.js';
 * 
 * // @ typedef {import('./typedef.js').ServiceConfig} ServiceConfig
 * // @ typedef {import('./typedef.js').HealthStatus} HealthStatus
 * 
 * class MyService extends ServiceBase {
 *   async _init(config) {
 *     // config is typed as ServiceConfig
 *   }
 *   
 *   async _healthCheck() {
 *     // Return type is HealthStatus
 *     return { latency: 10 };
 *   }
 * }
 * 
 * @example
 * // When using ServiceManager
 * import { ServiceManager } from './ServiceManager.js';
 * 
 * // @ typedef {import('./typedef.js').ServiceManagerConfig} ServiceManagerConfig
 * // @ typedef {import('./typedef.js').ServiceRegistrationOptions} ServiceRegistrationOptions
 * 
 * const config = {
 *   environment: 'development',
 *   stopTimeout: 5000
 * };
 * 
 * const manager = new ServiceManager(config);
 * 
 * const options = {
 *   dependencies: ['database'],
 *   tags: ['critical']
 * };
 * 
 * manager.register('auth', AuthService, {}, options);
 */

/**
 * Service configuration object passed to service initialization
 * @typedef {Object} ServiceConfig
 * @property {*} [key] - Service-specific configuration properties
 */

/**
 * Options for creating a service instance
 * @typedef {Object} ServiceOptions
 * @property {string} [logLevel] - Initial log level for the service
 * @property {number} [shutdownTimeout=5000] - Timeout for graceful shutdown
 */

/**
 * Options for stopping a service
 * @typedef {Object} StopOptions
 * @property {number} [timeout] - Override shutdown timeout
 * @property {boolean} [force=false] - Force stop even if timeout exceeded
 */

/**
 * Health status returned by service health checks
 * @typedef {Object} HealthStatus
 * @property {string} name - Service name
 * @property {string} state - Current service state
 * @property {boolean} healthy - Whether the service is healthy
 * @property {string} [error] - Error message if unhealthy
 * @property {string} [checkError] - Error from health check itself
 * @property {*} [key] - Additional health check properties
 */

/**
 * Event emitted when service state changes
 * @typedef {Object} StateChangeEvent
 * @property {string} service - Service name
 * @property {string} oldState - Previous state
 * @property {string} newState - New state
 */

/**
 * Event emitted when service health changes
 * @typedef {Object} HealthChangeEvent
 * @property {string} service - Service name
 * @property {boolean} healthy - New health status
 */

/**
 * Event emitted when service encounters an error
 * @typedef {Object} ServiceErrorEvent
 * @property {string} service - Service name
 * @property {string} operation - Operation that failed
 * @property {Error} error - Error that occurred
 */

/**
 * Service class constructor type
 * @typedef {new (name: string, options?: ServiceOptions) => ServiceBase} ServiceConstructor
 */

/**
 * Options for registering a service
 * @typedef {Object} ServiceRegistrationOptions
 * @property {string[]} [dependencies=[]] - Services this service depends on
 * @property {string[]} [tags=[]] - Tags for grouping services
 * @property {number} [priority=0] - Startup priority (higher starts first)
 */

/**
 * Configuration for ServiceManager
 * @typedef {Object} ServiceManagerConfig
 * @property {string} [environment='production'] - Runtime environment
 * @property {boolean} [autoStart=false] - Auto-start services on registration
 * @property {number} [stopTimeout=10000] - Default timeout for stopping services
 * @property {string} [logLevel] - Initial log level for ServiceManager
 * @property {LogConfig} [logConfig={}] - Logging configuration
 */

/**
 * Logging configuration
 * @typedef {Object} LogConfig
 * @property {string} [defaultLevel] - Default log level for services
 * @property {string} [globalLevel] - Override level for all services
 * @property {Object<string, string>} [serviceLevels] - Per-service log levels
 */

/**
 * Internal service registry entry
 * @typedef {Object} ServiceEntry
 * @property {ServiceConstructor} ServiceClass - Service class constructor
 * @property {ServiceBase|null} instance - Service instance (lazy-created)
 * @property {ServiceConfig} config - Service configuration
 * @property {string[]} dependencies - Service dependencies
 * @property {Set<string>} dependents - Services that depend on this one
 * @property {string[]} tags - Service tags
 * @property {number} priority - Startup priority
 */

/**
 * Result of health check for all services
 * @typedef {Object<string, HealthStatus>} HealthCheckResult
 */

/**
 * Base class interface that services must implement
 * @typedef {Object} ServiceBase
 * @property {string} name - Service name
 * @property {string} state - Current state
 * @property {boolean} healthy - Health status
 * @property {Error|null} error - Last error
 * @property {import('$lib/classes/logging').Logger} logger - Service logger
 * @property {(config?: ServiceConfig) => Promise<boolean>} initialize
 * @property {() => Promise<boolean>} start
 * @property {(options?: StopOptions) => Promise<boolean>} stop
 * @property {() => Promise<boolean>} recover
 * @property {() => Promise<boolean>} destroy
 * @property {() => Promise<HealthStatus>} getHealth
 * @property {(level: string) => boolean} setLogLevel
 * @property {(event: string, handler: Function) => Function} on
 * @property {(event: string, data: any) => boolean} emit
 */

export {};
