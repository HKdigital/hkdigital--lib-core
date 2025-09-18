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

/** @typedef {import('$lib/logging/typedef.js').LogLevel} LogLevel */

// ============================================================================
// PUBLIC TYPES
// ============================================================================

/**
 * Service configuration - either a config object or a config label string
 *
 * @typedef {Object<string, *>|string} ServiceConfigOrLabel
 */

/**
 * Options for registering a service
 *
 * @typedef {Object} ServiceRegistrationOptions
 * @property {string[]} [dependencies=[]] - Services this service depends on
 * @property {string[]} [tags=[]] - Tags for grouping services
 * @property {number} [startupPriority=0] - Higher starts first
 */

/**
 * Configuration for ServiceManager
 *
 * @typedef {Object} ServiceManagerConfig
 * @property {boolean} [debug=false] - Debug mode switch
 * @property {boolean} [autoStart=false] - Auto-start services on registration
 * @property {number} [stopTimeout=10000] - Default timeout for stopping services
 * @property {LogLevel} [defaultLogLevel] - Default log level for new services
 * @property {LogLevel} [managerLogLevel] - Initial log level for ServiceManager
 * @property {string|Record<string,LogLevel>} [serviceLogLevels]
 *   Per-service log levels:
 *   - String: "auth:debug,database:info"
 *   - Object: { auth: "debug", database: "info" }
 */

/**
 * Result of health check for all services
 * @typedef {Object<string,
 *   import('../service-base/typedef.js').HealthStatus>} HealthCheckResult
 */

/**
 * Service class constructor type
 *
 * @typedef {new (name: string, options?: import('../service-base/typedef.js').ServiceOptions)
 *   => import('../service-base/typedef.js').ServiceInstance} ServiceConstructor
 */

/**
 * ServiceManager plugin interface
 *
 * @typedef {Object} ServiceManagerPlugin
 * @property {string} name - Unique plugin identifier
 * @property {import('./ServiceManager.js').ServiceManager|null} manager - ServiceManager reference
 * @property {function(import('./ServiceManager.js').ServiceManager): void} attach - Attach to ServiceManager
 * @property {function(): void} detach - Detach from ServiceManager
 * @property {function(string,
 *   ServiceEntry<import('../service-base/typedef.js').ServiceInstance>, *
 * ): Promise<*|undefined>} [resolveServiceConfig] - Optional config resolution
 */

// ============================================================================
// INTERNAL TYPES
// ============================================================================

/**
 * Internal service registry entry, an internal registry entry that the
 * ServiceManager uses to track each registered service.
 *
 * @template {import('../service-base/typedef.js').ServiceInstance} T
 * @typedef {Object} ServiceEntry
 * @property {new (name: string, options?: *) => T} ServiceClass - Service class constructor
 * @property {T|null} instance - Service instance (lazy-created)
 * @property {ServiceConfigOrLabel} serviceConfigOrLabel
 * @property {string[]} dependencies
 * @property {Set<string>} dependents - Services that depend on this service
 * @property {string[]} tags
 * @property {number} startupPriority - Startup priority
 */

export {};
