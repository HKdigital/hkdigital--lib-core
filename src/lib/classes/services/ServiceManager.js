/**
 * @fileoverview Service manager for coordinating service lifecycle.
 *
 * The ServiceManager provides centralized registration, lifecycle management,
 * and coordination of services. It maintains a registry of all services,
 * manages dependencies between them, and provides events for global service
 * state changes.
 *
 * @example
 * // Basic usage
 * import { ServiceManager } from './ServiceManager.js';
 * import DatabaseService from './services/DatabaseService.js';
 * import ApiService from './services/ApiService.js';
 *
 * // Create a service manager
 * const manager = new ServiceManager();
 *
 * // Register services
 * manager.register('database', new DatabaseService());
 * manager.register('api', new ApiService(), { dependencies: ['database'] });
 *
 * // Initialize all services
 * await manager.initializeAll({
 *   database: { connectionString: 'mongodb://localhost:27017' },
 *   api: { port: 3000 }
 * });
 *
 * // Start all services (respecting dependencies)
 * await manager.startAll();
 *
 * // Listen for service events
 * manager.on('service:started', ({ service }) => {
 *   console.log(`Service ${service} started`);
 * });
 *
 * // Get service instance
 * const db = manager.getService('database');
 * await db.query('SELECT * FROM users');
 *
 * // Later, stop all services
 * await manager.stopAll();
 */

import { EventEmitter } from '$lib/classes/events';
import { Logger, INFO } from '$lib/classes/logging';

import {
  CREATED,
  INITIALIZING,
  INITIALIZED,
  STARTING,
  RUNNING,
  STOPPING,
  STOPPED,
  DESTROYING,
  DESTROYED,
  ERROR,
  RECOVERING
} from './constants.js';

/**
 * @typedef {Object} ServiceEntry
 * @property {Object} instance - Service instance
 * @property {Object} config - Service configuration
 * @property {string[]} dependencies - List of service dependencies
 * @property {Function} stateChangedUnsubscribe - Unsubscribe function for state events
 * @property {Function} errorUnsubscribe - Unsubscribe function for error events
 */

/**
 * Manager for coordinating services lifecycle
 */
export default class ServiceManager {
  /**
   * Create a new service manager
   *
   * @param {Object} [options] - Manager options
   * @param {string} [options.logLevel=INFO] - Log level for the manager
   */
  constructor(options = {}) {
    /**
     * Map of registered services
     * @type {Map<string, ServiceEntry>}
     * @private
     */
    this.services = new Map();

    /**
     * Event emitter for service events
     * @type {EventEmitter}
     */
    this.events = new EventEmitter();

    /**
     * Service manager logger
     * @type {Logger}
     */
    this.logger = new Logger('ServiceManager', options.logLevel || INFO);

    /**
     * Service dependency graph
     * @type {Map<string, Set<string>>}
     * @private
     */
    this.dependencyGraph = new Map();

    this.logger.debug('Service manager created');
  }

  /**
   * Register an event handler
   *
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(eventName, handler) {
    return this.events.on(eventName, handler);
  }

  /**
   * Remove an event handler
   *
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @returns {boolean} True if handler was removed
   */
  off(eventName, handler) {
    return this.events.off(eventName, handler);
  }

  /**
   * Emit an event
   *
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   * @returns {boolean} True if event had listeners
   * @private
   */
  _emit(eventName, data) {
    return this.events.emit(eventName, data);
  }

  /**
   * Register a service
   *
   * @param {string} name - Service name
   * @param {Object} instance - Service instance
   * @param {Object} [options] - Registration options
   * @param {string[]} [options.dependencies=[]] - Service dependencies
   * @param {Object} [options.config={}] - Service configuration
   * @returns {boolean} True if registration was successful
   *
   * @example
   * manager.register('database', new DatabaseService());
   * manager.register('api', new ApiService(), {
   *   dependencies: ['database'],
   *   config: { port: 3000 }
   * });
   */
  register(name, instance, options = {}) {
    if (this.services.has(name)) {
      this.logger.warn(`Service '${name}' already registered`);
      return false;
    }

    const { dependencies = [], config = {} } = options;

    // Check if dependencies are valid
    for (const dep of dependencies) {
      if (!this.services.has(dep)) {
        this.logger.warn(
          `Cannot register service '${name}': missing dependency '${dep}'`
        );
        return false;
      }
    }

    // Create service entry
    const entry = {
      instance,
      config,
      dependencies,
      stateChangedUnsubscribe: null,
      errorUnsubscribe: null
    };

    // Subscribe to service events
    entry.stateChangedUnsubscribe = instance.on('stateChanged', event => {
      this._handleStateChanged(name, event);
    });

    entry.errorUnsubscribe = instance.on('error', event => {
      this._handleError(name, event);
    });

    // Add to registry
    this.services.set(name, entry);

    // Update dependency graph
    this._updateDependencyGraph();

    this.logger.info(`Service '${name}' registered`, { dependencies });
    this._emit('service:registered', { service: name });

    return true;
  }

  /**
   * Unregister a service
   *
   * @param {string} name - Service name
   * @returns {boolean} True if unregistration was successful
   *
   * @example
   * manager.unregister('api');
   */
  unregister(name) {
    const entry = this.services.get(name);
    if (!entry) {
      this.logger.warn(`Service '${name}' not registered`);
      return false;
    }

    // Check if other services depend on this one
    for (const [serviceName, serviceEntry] of this.services.entries()) {
      if (serviceEntry.dependencies.includes(name)) {
        this.logger.error(
          `Cannot unregister service '${name}': ` +
          `'${serviceName}' depends on it`
        );
        return false;
      }
    }

    // Clean up event subscriptions
    if (entry.stateChangedUnsubscribe) {
      entry.stateChangedUnsubscribe();
    }

    if (entry.errorUnsubscribe) {
      entry.errorUnsubscribe();
    }

    // Remove from registry
    this.services.delete(name);

    // Update dependency graph
    this._updateDependencyGraph();

    this.logger.info(`Service '${name}' unregistered`);
    this._emit('service:unregistered', { service: name });

    return true;
  }

  /**
   * Get a service instance
   *
   * @param {string} name - Service name
   * @returns {Object|null} Service instance or null if not found
   *
   * @example
   * const db = manager.getService('database');
   * await db.query('SELECT * FROM users');
   */
  getService(name) {
    const entry = this.services.get(name);
    return entry ? entry.instance : null;
  }

  /**
   * Initialize a specific service
   *
   * @param {string} name - Service name
   * @param {Object} [config] - Service configuration (overrides config from
   *                            registration)
   * @returns {Promise<boolean>} True if initialization was successful
   *
   * @example
   * await manager.initializeService('database', {
   *   connectionString: 'mongodb://localhost:27017'
   * });
   */
  async initializeService(name, config) {
    const entry = this.services.get(name);
    if (!entry) {
      this.logger.error(`Cannot initialize unknown service '${name}'`);
      return false;
    }

    // Merge configs if provided
    const mergedConfig = config
      ? { ...entry.config, ...config }
      : entry.config;

    this.logger.debug(`Initializing service '${name}'`);
    const result = await entry.instance.initialize(mergedConfig);

    if (result) {
      this.logger.info(`Service '${name}' initialized`);
    } else {
      this.logger.error(`Service '${name}' initialization failed`);
    }

    return result;
  }

  /**
   * Initialize all registered services
   *
   * @param {Object} [configs] - Configuration map for services
   * @returns {Promise<boolean>} True if all services initialized successfully
   *
   * @example
   * await manager.initializeAll({
   *   database: { connectionString: 'mongodb://localhost:27017' },
   *   api: { port: 3000 }
   * });
   */
  async initializeAll(configs = {}) {
    let allSuccessful = true;

    this.logger.info('Initializing all services');

    for (const [name, entry] of this.services.entries()) {
      const config = configs[name] || entry.config;
      const success = await this.initializeService(name, config);

      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      this.logger.info('All services initialized successfully');
    } else {
      this.logger.error('Some services failed to initialize');
    }

    return allSuccessful;
  }

  /**
   * Start a specific service and its dependencies
   *
   * @param {string} name - Service name
   * @returns {Promise<boolean>} True if start was successful
   *
   * @example
   * await manager.startService('api');
   */
  async startService(name) {
    const entry = this.services.get(name);
    if (!entry) {
      this.logger.error(`Cannot start unknown service '${name}'`);
      return false;
    }

    // Check if service is already running
    if (entry.instance.state === RUNNING) {
      this.logger.debug(`Service '${name}' is already running`);
      return true;
    }

    // Start dependencies first
    for (const depName of entry.dependencies) {
      const depEntry = this.services.get(depName);

      if (!depEntry) {
        this.logger.error(
          `Cannot start service '${name}': ` +
          `dependency '${depName}' not found`
        );
        return false;
      }

      if (depEntry.instance.state !== RUNNING) {
        const success = await this.startService(depName);
        if (!success) {
          this.logger.error(
            `Cannot start service '${name}': ` +
            `dependency '${depName}' failed to start`
          );
          return false;
        }
      }
    }

    // Start this service
    this.logger.debug(`Starting service '${name}'`);
    const result = await entry.instance.start();

    if (result) {
      this.logger.info(`Service '${name}' started`);
    } else {
      this.logger.error(`Service '${name}' failed to start`);
    }

    return result;
  }

  /**
   * Start all services in dependency order
   *
   * @returns {Promise<boolean>} True if all services started successfully
   *
   * @example
   * await manager.startAll();
   */
  async startAll() {
    let allSuccessful = true;
    const started = new Set();

    this.logger.info('Starting all services');

    // Get dependency ordered list
    const orderedServices = this._getStartOrder();

    // Start services in order
    for (const name of orderedServices) {
      if (started.has(name)) {
        continue; // Already started as a dependency
      }

      const success = await this.startService(name);

      if (success) {
        started.add(name);
      } else {
        allSuccessful = false;
        this.logger.error(`Failed to start service '${name}'`);
      }
    }

    if (allSuccessful) {
      this.logger.info('All services started successfully');
    } else {
      this.logger.error('Some services failed to start');
    }

    return allSuccessful;
  }

  /**
   * Stop a specific service and services that depend on it
   *
   * @param {string} name - Service name
   * @param {Object} [options] - Stop options
   * @param {boolean} [options.force=false] - Force stop even with dependents
   * @returns {Promise<boolean>} True if stop was successful
   *
   * @example
   * await manager.stopService('database');
   */
  async stopService(name, options = {}) {
    const { force = false } = options;
    const entry = this.services.get(name);

    if (!entry) {
      this.logger.error(`Cannot stop unknown service '${name}'`);
      return false;
    }

    // Check if already stopped
    if (entry.instance.state !== RUNNING) {
      this.logger.debug(`Service '${name}' is not running`);
      return true;
    }

    // Find services that depend on this one
    const dependents = [];
    for (const [serviceName, serviceEntry] of this.services.entries()) {
      if (serviceEntry.dependencies.includes(name) &&
          serviceEntry.instance.state === RUNNING) {
        dependents.push(serviceName);
      }
    }

    // If there are dependents, stop them first or fail if not forced
    if (dependents.length > 0) {
      if (!force) {
        this.logger.error(
          `Cannot stop service '${name}': ` +
          `other services depend on it: ${dependents.join(', ')}`
        );
        return false;
      }

      this.logger.warn(
        `Force stopping service '${name}' with dependents: ` +
        dependents.join(', ')
      );

      // Stop all dependents first
      for (const dependent of dependents) {
        const success = await this.stopService(dependent, { force });
        if (!success) {
          this.logger.error(
            `Failed to stop dependent service '${dependent}'`
          );
          return false;
        }
      }
    }

    // Stop this service
    this.logger.debug(`Stopping service '${name}'`);
    const result = await entry.instance.stop();

    if (result) {
      this.logger.info(`Service '${name}' stopped`);
    } else {
      this.logger.error(`Service '${name}' failed to stop`);
    }

    return result;
  }

  /**
   * Stop all services in reverse dependency order
   *
   * @param {Object} [options] - Stop options
   * @param {boolean} [options.force=false] - Force stop even with errors
   * @returns {Promise<boolean>} True if all services stopped successfully
   *
   * @example
   * await manager.stopAll();
   */
  async stopAll(options = {}) {
    const { force = false } = options;
    let allSuccessful = true;

    this.logger.info('Stopping all services');

    // Get reverse dependency order
    const orderedServices = this._getStartOrder().reverse();

    // Stop services in reverse order
    for (const name of orderedServices) {
      const entry = this.services.get(name);

      if (entry.instance.state === RUNNING) {
        const success = await this.stopService(name, { force: true });

        if (!success) {
          this.logger.error(`Failed to stop service '${name}'`);
          allSuccessful = false;

          if (!force) {
            break;
          }
        }
      }
    }

    if (allSuccessful) {
      this.logger.info('All services stopped successfully');
    } else {
      this.logger.error('Some services failed to stop');
    }

    return allSuccessful;
  }

  /**
   * Destroy a service and remove it from the manager
   *
   * @param {string} name - Service name
   * @param {Object} [options] - Destroy options
   * @param {boolean} [options.force=false] - Force destroy even with dependents
   * @returns {Promise<boolean>} True if service was destroyed
   *
   * @example
   * await manager.destroyService('api');
   */
  async destroyService(name, options = {}) {
    const { force = false } = options;
    const entry = this.services.get(name);

    if (!entry) {
      this.logger.error(`Cannot destroy unknown service '${name}'`);
      return false;
    }

    // If running, stop first
    if (entry.instance.state === RUNNING) {
      const stopSuccess = await this.stopService(name, { force });
      if (!stopSuccess) {
        return false;
      }
    }

    // Check for dependents
    const dependents = [];
    for (const [serviceName, serviceEntry] of this.services.entries()) {
      if (serviceEntry.dependencies.includes(name)) {
        dependents.push(serviceName);
      }
    }

    if (dependents.length > 0 && !force) {
      this.logger.error(
        `Cannot destroy service '${name}': ` +
        `other services depend on it: ${dependents.join(', ')}`
      );
      return false;
    }

    // Destroy the service
    this.logger.debug(`Destroying service '${name}'`);
    const result = await entry.instance.destroy();

    if (result) {
      this.logger.info(`Service '${name}' destroyed`);

      // Unregister after successful destruction
      this.unregister(name);
    } else {
      this.logger.error(`Service '${name}' failed to destroy`);
    }

    return result;
  }

  /**
   * Destroy all services and shutdown the manager
   *
   * @param {Object} [options] - Destroy options
   * @param {boolean} [options.force=false] - Force destroy even with errors
   * @returns {Promise<boolean>} True if all services were destroyed
   *
   * @example
   * await manager.destroyAll();
   */
  async destroyAll(options = {}) {
    const { force = false } = options;
    let allSuccessful = true;

    this.logger.info('Destroying all services');

    // Get reverse dependency order
    const orderedServices = this._getStartOrder().reverse();

    // Destroy services in reverse order
    for (const name of orderedServices) {
      if (this.services.has(name)) {
        const success = await this.destroyService(name, { force: true });

        if (!success) {
          this.logger.error(`Failed to destroy service '${name}'`);
          allSuccessful = false;

          if (!force) {
            break;
          }
        }
      }
    }

    // Clean up
    this.services.clear();
    this.dependencyGraph.clear();
    this.events.removeAllListeners();

    this.logger.info('Service manager shut down');

    return allSuccessful;
  }

  /**
   * Recover a service and its dependencies from error state
   *
   * @param {string} name - Service name
   * @param {Object} [options] - Recovery options
   * @param {boolean} [options.recursive=true] - Recursively recover dependencies
   * @param {boolean} [options.autoStart=true] - Auto-start service after recovery
   * @returns {Promise<boolean>} True if recovery was successful
   *
   * @example
   * // Recover a service and its dependencies
   * await manager.recoverService('api');
   *
   * // Recover just this service without auto-starting
   * await manager.recoverService('database', {
   *   recursive: false,
   *   autoStart: false
   * });
   */
  async recoverService(name, options = {}) {
    const {
      recursive = true,
      autoStart = true
    } = options;

    const entry = this.services.get(name);

    if (!entry) {
      this.logger.error(`Cannot recover unknown service '${name}'`);
      return false;
    }

    // Only proceed if service is in ERROR state
    if (entry.instance.state !== ERROR) {
      this.logger.debug(
        `Service '${name}' is not in ERROR state (current: ${entry.instance.state})`
      );
      return true; // Not an error, already in a valid state
    }

    // First recover dependencies if needed
    if (recursive) {
      // Build dependency recovery order
      const recoveryOrder = [];
      const visited = new Set();

      const visitDependencies = (serviceName) => {
        if (visited.has(serviceName)) return;
        visited.add(serviceName);

        const deps = this.services.get(serviceName)?.dependencies || [];
        for (const dep of deps) {
          visitDependencies(dep);
        }

        recoveryOrder.push(serviceName);
      };

      // Visit all dependencies first
      for (const dep of entry.dependencies) {
        visitDependencies(dep);
      }

      // Recover dependencies in the correct order
      for (const depName of recoveryOrder) {
        if (depName === name) continue; // Skip self

        const depEntry = this.services.get(depName);
        if (!depEntry) continue;

        if (depEntry.instance.state === ERROR) {
          this.logger.info(
            `Recovering dependency '${depName}' for service '${name}'`
          );

          const success = await this.recoverService(depName, options);
          if (!success) {
            this.logger.error(
              `Failed to recover dependency '${depName}' for '${name}'`
            );
            return false;
          }
        }
      }
    }

    // Now recover this service
    this.logger.debug(`Recovering service '${name}'`);
    const result = await entry.instance.recover();

    if (!result) {
      this.logger.error(`Failed to recover service '${name}'`);
      return false;
    }

    this.logger.info(`Service '${name}' recovered successfully`);

    // Auto-start if requested and all dependencies are running
    if (autoStart) {
      const canStart = entry.dependencies.every(dep => {
        const depEntry = this.services.get(dep);
        return depEntry && depEntry.instance.state === RUNNING;
      });

      if (canStart) {
        this.logger.debug(`Auto-starting recovered service '${name}'`);
        return await this.startService(name);
      }
    }

    return true;
  }

  /**
   * Recover all services in dependency order
   *
   * @param {Object} [options] - Recovery options
   * @param {boolean} [options.autoStart=true] - Auto-start services after recovery
   * @returns {Promise<boolean>} True if all recoveries were successful
   *
   * @example
   * // Recover all services and auto-start them
   * await manager.recoverAll();
   *
   * // Recover all services without auto-starting
   * await manager.recoverAll({ autoStart: false });
   */
  async recoverAll(options = {}) {
    let allSuccessful = true;
    const { autoStart = true } = options;

    this.logger.info('Recovering all services');

    // Find services in ERROR state
    const errorServices = [];
    for (const [name, entry] of this.services.entries()) {
      if (entry.instance.state === ERROR) {
        errorServices.push(name);
      }
    }

    if (errorServices.length === 0) {
      this.logger.info('No services in ERROR state');
      return true;
    }

    // Get dependency ordered list
    const orderedServices = this._getStartOrder();

    // Recover services in order
    for (const name of orderedServices) {
      const entry = this.services.get(name);

      if (entry.instance.state === ERROR) {
        const success = await this.recoverService(name, {
          recursive: false, // Already handling order here
          autoStart
        });

        if (!success) {
          allSuccessful = false;
          this.logger.error(`Failed to recover service '${name}'`);
        }
      }
    }

    if (allSuccessful) {
      this.logger.info('All services recovered successfully');

      // If auto-start enabled, start services that weren't auto-started
      if (autoStart) {
        await this.startAll();
      }
    } else {
      this.logger.error('Some services failed to recover');
    }

    return allSuccessful;
  }

  /**
   * Set log level for a specific service or all services
   *
   * @param {string} level - New log level
   * @param {string} [serviceName] - Service to set level for, or all if omitted
   * @returns {boolean} True if level was set successfully
   *
   * @example
   * // Set level for specific service
   * manager.setLogLevel(DEBUG, 'database');
   *
   * // Set level for all services including manager
   * manager.setLogLevel(INFO);
   */
  setLogLevel(level, serviceName) {
    if (serviceName) {
      // Set for specific service
      const entry = this.services.get(serviceName);
      if (!entry) {
        this.logger.error(`Cannot set log level for unknown service '${serviceName}'`);
        return false;
      }

      return entry.instance.setLogLevel(level);
    } else {
      // Set for all services and manager
      let allSuccess = true;

      // Set for the manager
      if (!this.logger.setLevel(level)) {
        allSuccess = false;
      }

      // Set for all services
      for (const [name, entry] of this.services.entries()) {
        if (!entry.instance.setLogLevel(level)) {
          this.logger.warn(`Failed to set log level for service '${name}'`);
          allSuccess = false;
        }
      }

      return allSuccess;
    }
  }

  /**
   * Get the names of all registered services
   *
   * @returns {string[]} List of service names
   *
   * @example
   * const services = manager.getServiceNames();
   * console.log(`Registered services: ${services.join(', ')}`);
   */
  getServiceNames() {
    return Array.from(this.services.keys());
  }

  /**
   * Get service status information
   *
   * @param {string} [name] - Service name, or all if omitted
   * @returns {Object|Array|null} Service status or null if not found
   *
   * @example
   * // Get status for all services
   * const allStatus = manager.getServiceStatus();
   *
   * // Get status for specific service
   * const dbStatus = manager.getServiceStatus('database');
   * console.log(`Database state: ${dbStatus.state}`);
   */
  getServiceStatus(name) {
    if (name) {
      // Get status for specific service
      const entry = this.services.get(name);
      if (!entry) {
        return null;
      }

      return {
        name,
        state: entry.instance.state,
        dependencies: entry.dependencies,
        error: entry.instance.error ? entry.instance.error.message : null
      };
    } else {
      // Get status for all services
      const statuses = [];

      for (const [name, entry] of this.services.entries()) {
        statuses.push({
          name,
          state: entry.instance.state,
          dependencies: entry.dependencies,
          error: entry.instance.error ? entry.instance.error.message : null
        });
      }

      return statuses;
    }
  }

  // Private methods

  /**
   * Handle state change events from services
   *
   * @private
   * @param {string} serviceName - Service name
   * @param {Object} event - State change event
   */
  _handleStateChanged(serviceName, event) {
    const { oldState, newState } = event;

    this.logger.debug(
      `Service '${serviceName}' state changed: ${oldState} -> ${newState}`
    );

    // Emit specific state events
    this._emit('service:stateChanged', {
      service: serviceName,
      oldState,
      newState
    });

    // Emit events for specific states
    if (newState === INITIALIZED) {
      this._emit('service:initialized', { service: serviceName });
    } else if (newState === RUNNING) {
      this._emit('service:started', { service: serviceName });
    } else if (newState === STOPPED) {
      this._emit('service:stopped', { service: serviceName });
    } else if (newState === DESTROYED) {
      this._emit('service:destroyed', { service: serviceName });
    } else if (newState === ERROR) {
      this._emit('service:error', {
        service: serviceName,
        error: this.services.get(serviceName).instance.error
      });
    } else if (newState === RECOVERING) {
      this._emit('service:recovering', { service: serviceName });
    }
  }

  /**
   * Handle error events from services
   *
   * @private
   * @param {string} serviceName - Service name
   * @param {Object} event - Error event
   */
  _handleError(serviceName, event) {
    const { operation, error } = event;

    this.logger.error(
      `Service '${serviceName}' error during ${operation}`,
    );

    this._emit('service:error', {
      service: serviceName,
      operation,
      error
    });
  }

  /**
   * Update the dependency graph
   *
   * @private
   */
  _updateDependencyGraph() {
    this.dependencyGraph.clear();

    // Add all services to the graph
    for (const name of this.services.keys()) {
      this.dependencyGraph.set(name, new Set());
    }

    // Add dependencies
    for (const [name, entry] of this.services.entries()) {
      for (const dep of entry.dependencies) {
        this.dependencyGraph.get(name).add(dep);
      }
    }

    // Check for circular dependencies
    this._checkForCircularDependencies();
  }

  /**
   * Check for circular dependencies in the graph
   *
   * @private
   */
  _checkForCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();

    const checkNode = (node) => {
      if (!visited.has(node)) {
        visited.add(node);
        recursionStack.add(node);

        const dependencies = this.dependencyGraph.get(node);
        if (dependencies) {
          for (const dep of dependencies) {
            if (!visited.has(dep) && checkNode(dep)) {
              return true;
            } else if (recursionStack.has(dep)) {
              this.logger.error(
                `Circular dependency detected: ` +
                `'${node}' -> '${dep}'`
              );
              return true;
            }
          }
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const node of this.dependencyGraph.keys()) {
      if (checkNode(node)) {
        break;
      }
    }
  }

  /**
   * Get optimal service start order based on dependencies
   *
   * @private
   * @returns {string[]} Services in dependency order
   */
  _getStartOrder() {
    const visited = new Set();
    const result = [];

    const visit = (node) => {
      if (visited.has(node)) return;

      visited.add(node);

      const dependencies = this.dependencyGraph.get(node);
      if (dependencies) {
        for (const dep of dependencies) {
          visit(dep);
        }
      }

      result.push(node);
    };

    // Visit all nodes
    for (const node of this.dependencyGraph.keys()) {
      visit(node);
    }

    return result;
  }
}
