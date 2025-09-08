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
 *   debug: true,
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
 * // Set manager log level (affects all services)
 * manager.setManagerLogLevel('DEBUG');
 *
 * // Set specific service log level
 * manager.setServiceLogLevel('database', 'ERROR');
 *
 * // Listen to all service logs
 * manager.on('service:log', (logEvent) => {
 *   writeToLogFile(logEvent);
 * });
 */

import { EventEmitter } from '$lib/generic/events.js';
import { Logger, DEBUG, INFO } from '$lib/logging/index.js';

import { 
  SERVICE_LOG, 
  STATE_CHANGED,
  HEALTH_CHANGED,
  ERROR,
  LOG,
  SERVICE_STATE_CHANGED,
  SERVICE_HEALTH_CHANGED,
  SERVICE_ERROR
} from './constants.js';
import { parseServiceLogLevels } from './util.js';

import {
  STATE_NOT_CREATED,
  STATE_CREATED,
  STATE_RUNNING,
  STATE_DESTROYED
} from '$lib/services/service-base/constants.js';

/**
 * @typedef {import('./typedef.js').ServiceConstructor} ServiceConstructor
 * @typedef {import('./typedef.js').ServiceRegistrationOptions} ServiceRegistrationOptions
 * @typedef {import('./typedef.js').ServiceManagerConfig} ServiceManagerConfig
 * @typedef {import('./typedef.js').ServiceEntry} ServiceEntry
 * @typedef {import('./typedef.js').ServiceConfigOrLabel} ServiceConfigOrLabel
 * @typedef {import('./typedef.js').HealthCheckResult} HealthCheckResult
 *
 * @typedef {import('../service-base/typedef.js').StopOptions} StopOptions
 * @typedef {import('../service-base/typedef.js').StateChangeEvent} StateChangeEvent
 * @typedef {import('../service-base/typedef.js').HealthChangeEvent} HealthChangeEvent
 * @typedef {import('../service-base/typedef.js').ServiceErrorEvent} ServiceErrorEvent
 * @typedef {import('$lib/logging/typedef.js').LogEvent} LogEvent
 */

/**
 * Service Manager for lifecycle and dependency management
 * @extends EventEmitter
 */
export class ServiceManager extends EventEmitter {
  /** @type {Map<string, import('./typedef.js').ServiceManagerPlugin>} */
  #plugins = new Map();

  /**
   * Create a new ServiceManager instance
   *
   * @param {ServiceManagerConfig} [config={}] - Manager configuration
   */
  constructor(config = {}) {
    super();

    /** @type {Map<string, ServiceEntry>} */
    this.services = new Map();

    const defaultLogLevel =
      config.defaultLogLevel || (config.debug ? DEBUG : INFO);
    const managerLogLevel = config.managerLogLevel || defaultLogLevel;
    const serviceLogLevels = config.serviceLogLevels;

    /** @type {Logger} */
    this.logger = new Logger('ServiceManager', managerLogLevel);

    /** @type {ServiceManagerConfig} */
    this.config = {
      debug: config.debug ?? false,
      autoStart: config.autoStart ?? false,
      stopTimeout: config.stopTimeout || 10000,
      defaultLogLevel
      // managerLogLevel will be set bysetManagerLogLevel()
      // serviceLogLevels will be set by setServiceLogLevel()
    };

    this.setManagerLogLevel(managerLogLevel);

    if (serviceLogLevels) {
      this.setServiceLogLevel(serviceLogLevels);
    }
  }

  /**
   * Attach a plugin to the ServiceManager
   *
   * @param {import('./typedef.js').ServiceManagerPlugin} plugin
   *   Plugin instance
   *
   * @throws {Error} If plugin name is already registered
   */
  attachPlugin(plugin) {
    if (this.#plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already attached`);
    }

    this.#plugins.set(plugin.name, plugin);
    plugin.attach(this);

    this.logger.debug(`Attached plugin '${plugin.name}'`);
  }

  /**
   * Detach a plugin from the ServiceManager
   *
   * @param {string} pluginName - Name of the plugin to detach
   *
   * @returns {boolean} True if plugin was detached
   */
  detachPlugin(pluginName) {
    const plugin = this.#plugins.get(pluginName);
    if (!plugin) return false;

    plugin.detach();
    this.#plugins.delete(pluginName);

    this.logger.debug(`Detached plugin '${pluginName}'`);
    return true;
  }

  /**
   * Register a service class with the manager
   *
   * @param {string} name - Unique service identifier
   * @param {ServiceConstructor} ServiceClass - Service class constructor
   * @param {ServiceConfigOrLabel} [serviceConfigOrLabel={}]
   *   Service configuration object or config label string
   * @param {ServiceRegistrationOptions} [options={}] - Registration options
   *
   * @throws {Error} If service name is already registered
   */
  register(name, ServiceClass, serviceConfigOrLabel = {}, options = {}) {
    if (this.services.has(name)) {
      throw new Error(`Service '${name}' already registered`);
    }

    /** @type {ServiceEntry} */
    const entry = {
      ServiceClass,
      instance: null,
      serviceConfigOrLabel: serviceConfigOrLabel,
      dependencies: options.dependencies || [],
      dependents: new Set(),
      tags: options.tags || [],
      startupPriority: options.startupPriority || 0
    };

    // Track dependents
    entry.dependencies.forEach((dep) => {
      const depEntry = this.#getServiceEntry(dep);
      depEntry.dependents.add(name);
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
   * @returns {import('../service-base/typedef.js').ServiceInstance|null}
   *   Service instance or null if not found
   */
  get(name) {
    // @throws service not found
    const entry = this.#getServiceEntry(name);

    if (!entry.instance) {
      try {
        entry.instance = new entry.ServiceClass(name);

        // Apply log level
        const logLevel = this.#getServiceLogLevel(name);
        if (logLevel) {
          entry.instance.setLogLevel(logLevel);
        }

        // Forward events
        this._attachServiceEvents(name, entry.instance);

        this.logger.debug(`Created instance for '${name}'`);
      } catch (error) {
        this.logger.error(
          `Failed to create instance for '${name}'`,
          /** @type {Error} */ (error)
        );
        return null;
      }
    }

    return entry.instance;
  }

  /**
   * Configure a service
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if configuration succeeded
   */
  async configureService(name) {
    const instance = this.get(name);
    if (!instance) return false;

    const entry = this.#getServiceEntry(name);

    const config = await this.#resolveServiceConfig(name, entry);

    return await instance.configure(config);
  }

  /**
   * Start a service and its dependencies
   *
   * @param {string} name - Service name
   *
   * @returns {Promise<boolean>} True if service started successfully
   */
  async startService(name) {
    const entry = this.#getServiceEntry(name);
    if (!entry) {
      this.logger.warn(`Cannot start unregistered service '${name}'`);
      return false;
    }

    // Start dependencies first
    for (const dep of entry.dependencies) {
      if (!(await this.isRunning(dep))) {
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

    if (
      instance.state === STATE_CREATED ||
      instance.state === STATE_DESTROYED
    ) {
      // Service is not created or has been destroyed
      // => configure needed

      const configured = await this.configureService(name);

      if (!configured) {
        return false;
      }
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
    const entry = this.#getServiceEntry(name);

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
    const sorted = this.#topologicalSort();
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
    const sorted = this.#topologicalSort().reverse();
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
          this.#stopAllSequentially(sorted, results, stopOptions),
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
      await this.#stopAllSequentially(sorted, results, stopOptions);
    }

    return Object.fromEntries(results);
  }

  /**
   * Get health status for all services
   *
   * @returns {Promise<HealthCheckResult>} Health status for all services
   */
  async checkHealth() {
    /** @type {HealthCheckResult} */
    const health = {};

    for (const [name, entry] of this.services) {
      if (entry.instance) {
        health[name] = await entry.instance.getHealth();
      } else {
        health[name] = {
          name,
          state: STATE_NOT_CREATED,
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
    return instance ? instance.state === STATE_RUNNING : false;
  }

  /**
   * Listen to log messages emitted by individual services
   *
   * @param {(logEvent: LogEvent) => void} listener - Log event handler
   *
   * @returns {Function} Unsubscribe function
   */
  onServiceLogEvent(listener) {
    return this.on(SERVICE_LOG, listener);
  }

  /**
   * Listen to log messages emitted by the ServiceManager itself
   *
   * @param {(logEvent: LogEvent) => void} listener - Log event handler
   *
   * @returns {Function} Unsubscribe function
   */
  onManagerLogEvent(listener) {
    return this.logger.on(LOG, listener);
  }

  /**
   * Listen to all log messages (both manager and services)
   *
   * @param {(logEvent: LogEvent) => void} listener - Log event handler
   *
   * @returns {Function} Unsubscribe function
   */
  onLogEvent(listener) {
    // Listen to both service and manager logs
    const unsubscribeService = this.onServiceLogEvent(listener);
    const unsubscribeManager = this.onManagerLogEvent(listener);

    // Return combined unsubscribe function
    return () => {
      unsubscribeService();
      unsubscribeManager();
    };
  }

  /**
   * Set log level for the ServiceManager itself
   *
   * @param {string} level - Log level to set for the ServiceManager
   */
  setManagerLogLevel(level) {
    this.config.managerLogLevel = level;
    this.logger.setLevel(level);
  }

  /**
   * Set log level for individual services
   *
   * @param {string|Object<string,string>} nameOrConfig
   *   Service configuration:
   *   - String with service name: 'auth' (requires level parameter)
   *   - String with config: 'auth:debug,database:info'
   *   - Object: { auth: 'debug', database: 'info' }
   * @param {string} [level] - Log level (required when nameOrConfig is service name)
   */
  setServiceLogLevel(nameOrConfig, level) {
    /** @type {{[name:string]: string}} */
    let serviceLevels = {};

    if (typeof nameOrConfig === 'string') {
      if (nameOrConfig.includes(':')) {
        // Parse string config: 'auth:debug,database:info'
        serviceLevels = parseServiceLogLevels(nameOrConfig);
      } else {
        // Single service name
        if (!level) {
          throw new Error(
            `Level parameter required for service '${nameOrConfig}'`
          );
        }
        serviceLevels[nameOrConfig] = level;
      }
    } else {
      // Object config: { auth: 'debug', database: 'info' }
      serviceLevels = nameOrConfig;
    }

    if (!this.config.serviceLogLevels) {
      this.config.serviceLogLevels = {};
    }

    // Apply service-specific log levels
    for (const [name, logLevel] of Object.entries(serviceLevels)) {
      this.config.serviceLogLevels[name] = logLevel;

      // Apply to existing instance
      const instance = this.get(name);
      if (instance) {
        instance.setLogLevel(logLevel);
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

  /**
   * Attach event listeners to forward service events
   *
   * @param {string} name - Service name
   * @param {import('../service-base/typedef.js').ServiceInstance} instance
   *   Service instance
   */
  _attachServiceEvents(name, instance) {
    // Forward service events
    instance.on(STATE_CHANGED, (/** @type {StateChangeEvent} */ data) => {
      this.emit(SERVICE_STATE_CHANGED, { service: name, data });
    });

    instance.on(HEALTH_CHANGED, (/** @type {HealthChangeEvent} */ data) => {
      this.emit(SERVICE_HEALTH_CHANGED, { service: name, data });
    });

    instance.on(ERROR, (/** @type {ServiceErrorEvent} */ data) => {
      this.emit(SERVICE_ERROR, { service: name, data });
    });

    // Forward log events
    instance.logger.on(LOG, (/** @type {LogEvent} */ logEvent) => {
      this.emit(SERVICE_LOG, logEvent);
    });
  }

  // Internal methods

  /**
   * Get internal service registration entry by name
   *
   * @param {string} name
   *
   * @throws {Error} service not registered
   *
   * @returns {ServiceEntry}
   */
  #getServiceEntry(name) {
    const entry = this.services.get(name);

    if (!entry) {
      throw new Error(`Service [${name}] has not been registered`);
    }

    return entry;
  }

  /**
   * Resolve service configuration using plugins
   *
   * @param {string} serviceName - Name of the service being configured
   * @param {ServiceEntry} serviceEntry - Service registration entry
   *
   * @returns {Promise<*>} Resolved configuration object
   */
  async #resolveServiceConfig(serviceName, serviceEntry) {
    let serviceConfigOrLabel = serviceEntry.serviceConfigOrLabel;

    if (typeof serviceConfigOrLabel === 'string') {
      const configLabel = serviceConfigOrLabel;

      // Let plugins resolve the config
      for (const plugin of this.#plugins.values()) {
        if (plugin.resolveServiceConfig) {
          const config = await plugin.resolveServiceConfig(
            serviceName,
            serviceEntry,
            configLabel
          );
          if (config !== undefined) {
            return config; // First plugin that resolves wins
          }
        }
      }
    } else {
      const config = serviceConfigOrLabel;
      return config;
    }
  }

  /**
   * Get the appropriate log level for a service
   *
   * @param {string} name - Service name
   *
   * @returns {string|undefined} Log level or undefined
   */
  #getServiceLogLevel(name) {
    const config = this.config;

    // Check in order of precedence:
    // 1. Service-specific level
    if (config.serviceLogLevels?.[name]) {
      return config.serviceLogLevels[name];
    }

    // 2. Default level fallback
    if (config.defaultLogLevel) {
      return config.defaultLogLevel;
    }

    // 3. No fallback - let service use its own default
    return undefined;
  }

  /**
   * Stop services sequentially
   *
   * @param {string[]} serviceNames - Ordered list of service names
   * @param {Map<string, boolean>} results - Results map to populate
   * @param {StopOptions} options - Stop options
   */
  async #stopAllSequentially(serviceNames, results, options) {
    for (const name of serviceNames) {
      try {
        const success = await this.stopService(name, options);
        results.set(name, success);
      } catch (error) {
        this.logger.error(
          `Error stopping '${name}'`,
          /** @type {Error} */ (error)
        );
        results.set(name, false);
      }
    }
  }

  /**
   * Sort services by dependencies using topological sort
   *
   * @throws {Error} If circular dependencies are detected
   *
   * @returns {string[]} Service names in dependency order
   */
  #topologicalSort() {
    /** @type {string[]}*/
    const sorted = [];

    const visited = new Set();
    const visiting = new Set();

    const visit = (/** @type {string} */ name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving '${name}'`);
      }

      visiting.add(name);

      const entry = this.#getServiceEntry(name);

      for (const dep of entry.dependencies) {
        visit(dep);
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
