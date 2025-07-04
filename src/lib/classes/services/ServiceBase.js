/**
 * @fileoverview Base service class with lifecycle management, health checks,
 * and integrated logging.
 *
 * ServiceBase provides a standardized lifecycle for all services with states,
 * events, logging, and error handling. Services extend this class and override
 * the protected methods to implement their specific functionality.
 *
 * @example
 * // Basic service implementation
 * import { ServiceBase } from './ServiceBase.js';
 *
 * class DatabaseService extends ServiceBase {
 *   async _init(config) {
 *     this.connectionString = config.connectionString;
 *   }
 *
 *   async _start() {
 *     this.connection = await createConnection(this.connectionString);
 *   }
 *
 *   async _stop() {
 *     await this.connection?.close();
 *   }
 * }
 *
 * // Usage
 * const db = new DatabaseService('database');
 * await db.initialize({ connectionString: 'postgres://...' });
 * await db.start();
 *
 * // Listen to events
 * db.on('healthChanged', ({ healthy }) => {
 *   console.log(`Database is ${healthy ? 'healthy' : 'unhealthy'}`);
 * });
 *
 * @example
 * // Service with recovery and health checks
 * class ApiService extends ServiceBase {
 *   async _recover() {
 *     // Custom recovery logic
 *     await this.reconnect();
 *   }
 *
 *   async _healthCheck() {
 *     const start = Date.now();
 *     await this.ping();
 *     return { latency: Date.now() - start };
 *   }
 * }
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
  ERROR as ERROR_STATE,
  RECOVERING
} from './service-states.js';

/**
 * @typedef {import('./typedef.js').ServiceConfig} ServiceConfig
 * @typedef {import('./typedef.js').ServiceOptions} ServiceOptions
 * @typedef {import('./typedef.js').StopOptions} StopOptions
 * @typedef {import('./typedef.js').HealthStatus} HealthStatus
 * @typedef {import('./typedef.js').StateChangeEvent} StateChangeEvent
 * @typedef {import('./typedef.js').HealthChangeEvent} HealthChangeEvent
 * @typedef {import('./typedef.js').ServiceErrorEvent} ServiceErrorEvent
 */

/**
 * Base class for all services with lifecycle management
 * @extends EventEmitter
 */
export class ServiceBase extends EventEmitter {
  /**
   * Create a new service instance
   *
   * @param {string} name - Service name
   * @param {ServiceOptions} [options={}] - Service options
   */
  constructor(name, options = {}) {
    super();

    /** @type {string} */
    this.name = name;

    /** @type {string} */
    this.state = CREATED;

    /** @type {boolean} */
    this.healthy = false;

    /** @type {Error|null} */
    this.error = null;

    /** @type {Logger} */
    this.logger = new Logger(name, options.logLevel || INFO);

    /** @private @type {number} */
    this._shutdownTimeout = options.shutdownTimeout || 5000;
  }

  /**
   * Initialize the service with configuration
   *
   * @param {ServiceConfig} [config={}] - Service-specific configuration
   *
   * @returns {Promise<boolean>} True if initialization succeeded
   */
  async initialize(config = {}) {
    if (this.state !== CREATED &&
        this.state !== STOPPED &&
        this.state !== DESTROYED) {
      this.logger.warn(`Cannot initialize from state: ${this.state}`);
      return false;
    }

    try {
      this._setState(INITIALIZING);
      this.logger.debug('Initializing service', { config });

      await this._init(config);

      this._setState(INITIALIZED);
      this.logger.info('Service initialized');
      return true;
    } catch (error) {
      this._setError('initialization', error);
      return false;
    }
  }

  /**
   * Start the service
   *
   * @returns {Promise<boolean>} True if the service started successfully
   */
  async start() {
    if (this.state !== INITIALIZED && this.state !== STOPPED) {
      this.logger.warn(`Cannot start from state: ${this.state}`);
      return false;
    }

    try {
      this._setState(STARTING);
      this.logger.debug('Starting service');

      await this._start();

      this._setState(RUNNING);
      this._setHealthy(true);
      this.logger.info('Service started');
      return true;
    } catch (error) {
      this._setError('startup', error);
      return false;
    }
  }

  /**
   * Stop the service with optional timeout
   *
   * @param {StopOptions} [options={}] - Stop options
   *
   * @returns {Promise<boolean>} True if the service stopped successfully
   */
  async stop(options = {}) {
    if (this.state !== RUNNING && this.state !== ERROR_STATE) {
      this.logger.warn(`Cannot stop from state: ${this.state}`);
      return true; // Already stopped
    }

    const timeout = options.timeout ?? this._shutdownTimeout;

    try {
      this._setState(STOPPING);
      this._setHealthy(false);
      this.logger.debug('Stopping service');

      // Wrap _stop in a timeout
      const stopPromise = this._stop();

      if (timeout > 0) {
        await Promise.race([
          stopPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown timeout')), timeout)
          )
        ]);
      } else {
        await stopPromise;
      }

      this._setState(STOPPED);
      this.logger.info('Service stopped');
      return true;
    } catch (error) {
      if (error.message === 'Shutdown timeout' && options.force) {
        this.logger.warn('Forced shutdown after timeout');
        this._setState(STOPPED);
        return true;
      }
      this._setError('shutdown', error);
      return false;
    }
  }

  /**
   * Recover the service from error state
   *
   * @returns {Promise<boolean>} True if recovery succeeded
   */
  async recover() {
    if (this.state !== ERROR_STATE) {
      this.logger.warn(
        `Can only recover from ERROR state, current: ${this.state}`
      );
      return false;
    }

    try {
      this._setState(RECOVERING);
      this.logger.info('Attempting recovery');

      // Try custom recovery first
      if (this._recover) {
        await this._recover();
        this._setState(RUNNING);
        this._setHealthy(true);
      } else {
        // Default: restart
        this._setState(STOPPED);
        await this.start();
      }

      this.error = null;
      this.logger.info('Recovery successful');
      return true;
    } catch (error) {
      this._setError('recovery', error);
      return false;
    }
  }

  /**
   * Destroy the service and cleanup resources
   *
   * @returns {Promise<boolean>} True if destruction succeeded
   */
  async destroy() {
    if (this.state === DESTROYED) {
      return true;
    }

    try {
      if (this.state === RUNNING) {
        await this.stop();
      }

      this._setState(DESTROYING);
      this.logger.debug('Destroying service');

      if (this._destroy) {
        await this._destroy();
      }

      this._setState(DESTROYED);
      this._setHealthy(false);
      this.logger.info('Service destroyed');

      // Cleanup
      this.removeAllListeners();
      this.logger.removeAllListeners();

      return true;
    } catch (error) {
      this._setError('destruction', error);
      return false;
    }
  }

  /**
   * Get the current health status of the service
   *
   * @returns {Promise<HealthStatus>} Health status object
   */
  async getHealth() {
    const baseHealth = {
      name: this.name,
      state: this.state,
      healthy: this.healthy,
      error: this.error?.message
    };

    if (this._healthCheck) {
      try {
        const customHealth = await this._healthCheck();
        return { ...baseHealth, ...customHealth };
      } catch (error) {
        return {
          ...baseHealth,
          healthy: false,
          checkError: error.message
        };
      }
    }

    return baseHealth;
  }

  /**
   * Set the service log level
   *
   * @param {string} level - New log level
   *
   * @returns {boolean} True if the level was set successfully
   */
  setLogLevel(level) {
    return this.logger.setLevel(level);
  }

  // Protected methods to override in subclasses

  /**
   * Initialize the service (override in subclass)
   *
   * @protected
   * @param {ServiceConfig} config - Service configuration
   *
   * @returns {Promise<void>}
   */
  async _init(config) {
    // Override in subclass
  }

  /**
   * Start the service (override in subclass)
   *
   * @protected
   *
   * @returns {Promise<void>}
   */
  async _start() {
    // Override in subclass
  }

  /**
   * Stop the service (override in subclass)
   *
   * @protected
   *
   * @returns {Promise<void>}
   */
  async _stop() {
    // Override in subclass
  }

  /**
   * Destroy the service (optional override)
   *
   * @protected
   *
   * @returns {Promise<void>}
   */
  async _destroy() {
    // Override in subclass if needed
  }

  /**
   * Recover from error state (optional override)
   *
   * @protected
   *
   * @returns {Promise<void>}
   */
  async _recover() {
    // Override in subclass if custom recovery needed
    // Default behavior is stop + start
  }

  /**
   * Perform health check (optional override)
   *
   * @protected
   *
   * @returns {Promise<Object>} Additional health information
   */
  async _healthCheck() {
    // Override in subclass if health checks needed
    return {};
  }

  // Private methods

  /**
   * Set the service state and emit event
   *
   * @private
   * @param {string} newState - New state value
   */
  _setState(newState) {
    const oldState = this.state;
    this.state = newState;

    this.emit('stateChanged', {
      oldState,
      newState
    });
  }

  /**
   * Set the health status and emit event if changed
   *
   * @private
   * @param {boolean} healthy - New health status
   */
  _setHealthy(healthy) {
    const wasHealthy = this.healthy;
    this.healthy = healthy;

    if (wasHealthy !== healthy) {
      this.emit('healthChanged', {
        healthy,
        wasHealthy
      });
    }
  }

  /**
   * Set error state and emit error event
   *
   * @private
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error that occurred
   */
  _setError(operation, error) {
    this.error = error;
    this._setState(ERROR_STATE);
    this._setHealthy(false);

    this.logger.error(`${operation} failed`, {
      error: error.message,
      stack: error.stack
    });

    this.emit('error', {
      operation,
      error
    });
  }
}

export default ServiceBase;
