/**
 * @fileoverview Service Manager for coordinating service lifecycle,
 * dependencies, and health monitoring.
 *
 * The ServiceManager handles registration, dependency resolution, startup
 * orchestration, and coordinated shutdown of services. It provides centralized
 * logging control and health monitoring for all registered services.
 *
 * @example
 * // Basic usage
 * import { ServiceManager } from './ServiceManager.js';
 * import DatabaseService from './services/DatabaseService.js';
 * import AuthService from './services/AuthService.js';
 *
 * const manager = new ServiceManager({
 *   environment: 'development',
 *   stopTimeout: 10000
 * });
 *
 * // Register services with dependencies
 * manager.register('database', DatabaseService, {
 *   connectionString: 'postgres://localhost/myapp'
 * });
 *
 * manager.register('auth', AuthService, {
 *   secret: process.env.JWT_SECRET
 * }, {
 *   dependencies: ['database'] // auth depends on database
 * });
 *
 * // Start all services
 * await manager.startAll();
 *
 * @example
 * // Advanced usage with health monitoring
 * manager.on('service:healthChanged', ({ service, healthy }) => {
 *   if (!healthy) {
 *     console.error(`Service ${service} became unhealthy`);
 *   }
 * });
 *
 * // Check health of all services
 * const health = await manager.checkHealth();
 * console.log('System health:', health);
 *
 * // Recover failed service
 * manager.on('service:error', async ({ service }) => {
 *   console.log(`Attempting to recover ${service}`);
 *   await manager.recoverService(service);
 * });
 *
 * @example
 * // Logging control
 * // Set global log level
 * manager.setLogLevel('*', 'DEBUG');
 *
 * // Set specific service log level
 * manager.setLogLevel('database', 'ERROR');
 *
 * // Listen to all service logs
 * manager.on('service:log', (logEvent) => {
 *   writeToLogFile(logEvent);
 * });
 */

import { EventEmitter } from '$lib/classes/events';
import { Logger, DEBUG, INFO, WARN } from '$lib/classes/logging';

import {
  CREATED,
  RUNNING,
  DESTROYED
} from './service-states.js';

/**
 * @typedef {import('./typedef.js').ServiceConstructor} ServiceConstructor
 * @typedef {import('./typedef.js').ServiceConfig} ServiceConfig
 * @typedef {import('./typedef.js').ServiceRegistrationOptions} ServiceRegistrationOptions
 * @typedef {import('./typedef.js').ServiceManagerConfig} ServiceManagerConfig
 * @typedef {import('./typedef.js').StopOptions} StopOptions
 * @typedef {import('./typedef.js').ServiceEntry} ServiceEntry
 * @typedef {import('./typedef.js').HealthCheckResult} HealthCheckResult
 */

/**
 * Service Manager for lifecycle and dependency management
 * @extends EventEmitter
 */
export class ServiceManager extends EventEmitter {
  /**
   * Create a new ServiceManager instance
   *
   * @param {ServiceManagerConfig} [config={}] - Manager configuration
   */
  constructor(config = {}) {
    super();

    /** @type {Map<string, ServiceEntry>} */
    this.services = new Map();

    /** @type {Logger} */
    this.logger = new Logger('ServiceManager', config.logLevel || INFO);

    /** @type {ServiceManagerConfig} */
    this.config = {
      environment: config.environment || 'production',
      autoStart: config.autoStart ?? false,
      stopTimeout: config.stopTimeout || 10000,
      logConfig: config.logConfig || {}
    };

    this._setupLogging();
  }

  /**
   * Register a service class with the manager
   *
   * @param {string} name - Unique service identifier
   * @param {ServiceConstructor} ServiceClass - Service class constructor
   * @param {ServiceConfig} [config={}] - Service configuration
   * @param {ServiceRegistrationOptions} [options={}] - Registration options
   *
   * @throws {Error} If service name is already registered
   */
  register(name, ServiceClass, config = {}, options = {}) {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' already registered`);
    }

    /** @type {ServiceEntry} */
    const entry = {
      ServiceClass,
      instance: null,
      config,
      dependencies: options.dependencies || [],
      dependents: new Set(),
      tags: options.tags || [],
      priority: options.priority || 0
    };

    // Track dependents
    entry.dependencies.forEach(dep => {
      const depEntry = this.services.get(dep);
      if (depEntry) {
        depEntry.dependents.add(name);
      }
    });

    this.services.set(name, entry);
    this.logger.debug(`Registered service '${name}'`, {
      dependencies: entry.dependencies,
      tags: entry.tags
    });
  }

  /**
   * Get or create a service instance
   *
   * @param {string} name - Service name
   *
   * @returns {import('./typedef.js').ServiceBase|null}
   *   Service instance or null if not found
   */
  get(name) {
    const entry = this.services.get(name);
    if (!entry) {
      this.logger.warn(`Service '${name}' not found`);
      return null;
    }

    if (!entry.instance) {
      try {
        entry.instance = new entry.ServiceClass(name);

        // Apply log level
        const logLevel = this._getServiceLogLevel(name);
        if (logLevel) {
          entry.instance.setLogLevel(logLevel);
        }

        // Forward events
        this._attachServiceEvents(name, entry.instance);

        this.logger.debug(`Created instance for '${name}'`);
      } catch (error) {
        this.logger.error(`Failed to create instance for '${name}'`, error);
        return null;
      }
    }

    return entry.instance;
  }

  /**
   * Initialize a service
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if initialization succeeded
   */
  async initService(name) {
    const instance = this.get(name);
    if (!instance) return false;

    const entry = this.services.get(name);
    return await instance.initialize(entry.config);
  }

  /**
   * Start a service and its dependencies
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if service started successfully
   */
  async startService(name) {
    const entry = this.services.get(name);
    if (!entry) {
      this.logger.warn(`Cannot start unregistered service '${name}'`);
      return false;
    }

    // Start dependencies first
    for (const dep of entry.dependencies) {
      if (!await this.isRunning(dep)) {
        this.logger.debug(`Starting dependency '${dep}' for '${name}'`);
        const started = await this.startService(dep);
        if (!started) {
          this.logger.error(
            `Failed to start dependency '${dep}' for '${name}'`
          );
          return false;
        }
      }
    }

    const instance = this.get(name);
    if (!instance) return false;

    // Initialize if needed
    if (instance.state === CREATED || instance.state === DESTROYED) {
      const initialized = await this.initService(name);
      if (!initialized) return false;
    }

    return await instance.start();
  }

  /**
   * Stop a service
   *
   * @param {string} name - Service name
   * @param {StopOptions} [options={}] - Stop options
   *
   * @returns {Promise<boolean>} True if service stopped successfully
   */
  async stopService(name, options = {}) {
    const instance = this.get(name);
    if (!instance) {
      this.logger.warn(`Cannot stop unregistered service '${name}'`);
      return true; // Already stopped
    }

    // Check dependents
    const entry = this.services.get(name);
    if (!options.force && entry && entry.dependents.size > 0) {
      const runningDependents = [];
      for (const dep of entry.dependents) {
        if (await this.isRunning(dep)) {
          runningDependents.push(dep);
        }
      }

      if (runningDependents.length > 0) {
        this.logger.warn(
          `Cannot stop '${name}' - required by: ${runningDependents.join(', ')}`
        );
        return false;
      }
    }

    return await instance.stop(options);
  }

  /**
   * Recover a service from error state
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if recovery succeeded
   */
  async recoverService(name) {
    const instance = this.get(name);
    if (!instance) return false;

    return await instance.recover();
  }

  /**
   * Start all registered services in dependency order
   *
   * @returns {Promise<Object<string, boolean>>} Map of service results
   */
  async startAll() {
    this.logger.info('Starting all services');

    // Sort by priority and dependencies
    const sorted = this._topologicalSort();
    const results = new Map();

    for (const name of sorted) {
      const success = await this.startService(name);
      results.set(name, success);

      if (!success) {
        this.logger.error(`Failed to start '${name}', stopping`);
        // Mark remaining services as not started
        for (const remaining of sorted) {
          if (!results.has(remaining)) {
            results.set(remaining, false);
          }
        }
        break;
      }
    }

    return Object.fromEntries(results);
  }

  /**
   * Stop all services in reverse dependency order
   *
   * @param {StopOptions} [options={}] - Stop options
   *
   * @returns {Promise<Object<string, boolean>>} Map of service results
   */
  async stopAll(options = {}) {
    this.logger.info('Stopping all services');

    const stopOptions = {
      timeout: options.timeout || this.config.stopTimeout,
      force: options.force || false
    };

    // Stop in reverse order
    const sorted = this._topologicalSort().reverse();
    const results = new Map();

    // Handle global timeout if specified
    if (stopOptions.timeout > 0) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Global shutdown timeout')),
          stopOptions.timeout
        )
      );

      try {
        // Race between stopping all services and timeout
        await Promise.race([
          this._stopAllSequentially(sorted, results, stopOptions),
          timeoutPromise
        ]);
      } catch (error) {
        if (error.message === 'Global shutdown timeout') {
          this.logger.error('Global shutdown timeout reached');
          // Mark any remaining services as failed
          for (const name of sorted) {
            if (!results.has(name)) {
              results.set(name, false);
            }
          }
        } else {
          throw error;
        }
      }
    } else {
      // No timeout, just stop sequentially
      await this._stopAllSequentially(sorted, results, stopOptions);
    }

    return Object.fromEntries(results);
  }

  /**
   * Stop services sequentially
   *
   * @private
   * @param {string[]} serviceNames - Ordered list of service names
   * @param {Map<string, boolean>} results - Results map to populate
   * @param {StopOptions} options - Stop options
   */
  async _stopAllSequentially(serviceNames, results, options) {
    for (const name of serviceNames) {
      try {
        const success = await this.stopService(name, options);
        results.set(name, success);
      } catch (error) {
        this.logger.error(`Error stopping '${name}'`, error);
        results.set(name, false);
      }
    }
  }

  /**
   * Get health status for all services
   *
   * @returns {Promise<HealthCheckResult>} Health status for all services
   */
  async checkHealth() {
    const health = {};

    for (const [name, entry] of this.services) {
      if (entry.instance) {
        health[name] = await entry.instance.getHealth();
      } else {
        health[name] = {
          name,
          state: 'NOT_CREATED',
          healthy: false
        };
      }
    }

    return health;
  }

  /**
   * Check if a service is currently running
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if service is running
   */
  async isRunning(name) {
    const instance = this.get(name);
    return instance ? instance.state === RUNNING : false;
  }

  /**
   * Set log level for a service or globally
   *
   * @param {string} name - Service name or '*' for global
   * @param {string} level - Log level to set
   */
  setLogLevel(name, level) {
    if (name === '*') {
      // Global level
      this.config.logConfig.globalLevel = level;

      // Apply to all existing services
      for (const [serviceName, entry] of this.services) {
        if (entry.instance) {
          entry.instance.setLogLevel(level);
        }
      }
    } else {
      // Service-specific level
      if (!this.config.logConfig.serviceLevels) {
        this.config.logConfig.serviceLevels = {};
      }
      this.config.logConfig.serviceLevels[name] = level;

      // Apply to existing instance
      const instance = this.get(name);
      if (instance) {
        instance.setLogLevel(level);
      }
    }
  }

  /**
   * Get all services with a specific tag
   *
   * @param {string} tag - Tag to filter by
   *
   * @returns {string[]} Array of service names
   */
  getServicesByTag(tag) {
    const services = [];
    for (const [name, entry] of this.services) {
      if (entry.tags.includes(tag)) {
        services.push(name);
      }
    }
    return services;
  }

  // Private methods

  /**
   * Setup logging configuration based on environment
   *
   * @private
   */
  _setupLogging() {
    // Set default log levels based on environment
    if (this.config.environment === 'development') {
      this.config.logConfig.defaultLevel = DEBUG;
    } else {
      this.config.logConfig.defaultLevel = WARN;
    }

    // Apply config
    if (this.config.logConfig.globalLevel) {
      this.logger.setLevel(this.config.logConfig.globalLevel);
    }
  }

  /**
   * Get the appropriate log level for a service
   *
   * @private
   * @param {string} name - Service name
   *
   * @returns {string|undefined} Log level or undefined
   */
  _getServiceLogLevel(name) {
    const config = this.config.logConfig;

    // Check in order of precedence:
    // 1. Global level (overrides everything)
    if (config.globalLevel) {
      return config.globalLevel;
    }

    // 2. Service-specific level
    if (config.serviceLevels?.[name]) {
      return config.serviceLevels[name];
    }

    // 3. Don't use defaultLevel as it might be too restrictive
    // Return undefined to let the service use its own default
    return undefined;
  }

  /**
   * Attach event listeners to forward service events
   *
   * @private
   * @param {string} name - Service name
   * @param {import('./typedef.js').ServiceBase} instance
   *   Service instance
   */
  _attachServiceEvents(name, instance) {
    // Forward service events
    instance.on('stateChanged', (data) => {
      this.emit('service:stateChanged', { ...data, service: name });
    });

    instance.on('healthChanged', (data) => {
      this.emit('service:healthChanged', { ...data, service: name });
    });

    instance.on('error', (data) => {
      this.emit('service:error', { ...data, service: name });
    });

    // Forward log events
    instance.logger.on('log', (logEvent) => {
      this.emit('service:log', { ...logEvent, service: name });
    });
  }

  /**
   * Sort services by dependencies using topological sort
   *
   * @private
   *
   * @returns {string[]} Service names in dependency order
   * @throws {Error} If circular dependencies are detected
   */
  _topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving '${name}'`);
      }

      visiting.add(name);

      const entry = this.services.get(name);
      if (entry) {
        for (const dep of entry.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    // Visit all services
    for (const name of this.services.keys()) {
      visit(name);
    }

    return sorted;
  }
}

export default ServiceManager;
