/**
 * @fileoverview Type definitions for ServiceManager class.
 * 
 * This file contains all TypeScript/JSDoc type definitions used by
 * the ServiceManager class and service registration.
 * 
 * @example
 * // When using ServiceManager
 * import { ServiceManager } from './ServiceManager.js';
 * 
 * // @ typedef {import('./typedef-service-manager.js').ServiceManagerConfig} ServiceManagerConfig
 * // @ typedef {import('./typedef-service-manager.js').ServiceRegistrationOptions} ServiceRegistrationOptions
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

// ============================================================================
// PUBLIC TYPES
// ============================================================================

/**
 * Options for registering a service
 *
 * @typedef {Object} ServiceRegistrationOptions
 * @property {string[]} [dependencies=[]] - Services this service depends on
 * @property {string[]} [tags=[]] - Tags for grouping services
 * @property {number} [priority=0] - Startup priority (higher starts first)
 */

/**
 * Configuration for ServiceManager
 *
 * @typedef {Object} ServiceManagerConfig
 * @property {boolean} [debug=false] - Debug mode switch
 * @property {boolean} [autoStart=false] - Auto-start services on registration
 * @property {number} [stopTimeout=10000] - Default timeout for stopping services
 * @property {string} [logLevel] - Initial log level for ServiceManager
 * @property {LogConfig} [logConfig={}] - Logging configuration
 */

/**
 * Logging configuration
 *
 * @typedef {Object} LogConfig
 * @property {string} [defaultLevel] - Default log level for services
 * @property {string} [globalLevel] - Override level for all services
 * @property {Object<string, string>} [serviceLevels] - Per-service log levels
 */

/**
 * Result of health check for all services
 * @typedef {Object<string, HealthStatus>} HealthCheckResult
 */

/**
 * Service class constructor type
 *
 * @typedef {new (name: string, options?: ServiceOptions) => ServiceInstance} ServiceConstructor
 */

// ============================================================================
// INTERNAL TYPES
// ============================================================================

/**
 * Internal service registry entry
 *
 * @typedef {Object} ServiceEntry
 * @property {ServiceConstructor} ServiceClass - Service class constructor
 * @property {ServiceInstance|null} instance - Service instance (lazy-created)
 * @property {*} config - Service configuration
 * @property {string[]} dependencies - Service dependencies
 * @property {Set<string>} dependents - Services that depend on this one
 * @property {string[]} tags - Service tags
 * @property {number} priority - Startup priority
 */

export {};
