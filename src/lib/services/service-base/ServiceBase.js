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
 *   async _configure(newConfig, oldConfig) {
 *     this.connectionString = config.newConfig;
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
 * await db.configure({ connectionString: 'postgres://...' });
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

import { EventEmitter } from '$lib/generic/events.js';
import { Logger, INFO } from '$lib/logging/index.js';
import { DetailedError } from '$lib/generic/errors.js';

import {
  STATE_CREATED,
  STATE_CONFIGURING,
  STATE_CONFIGURED,
  STATE_STARTING,
  STATE_RUNNING,
  STATE_STOPPING,
  STATE_STOPPED,
  STATE_DESTROYING,
  STATE_DESTROYED,
  STATE_ERROR,
  STATE_RECOVERING,
  EVENT_STATE_CHANGED,
  EVENT_TARGET_STATE_CHANGED,
  EVENT_HEALTH_CHANGED,
  EVENT_ERROR
} from './constants.js';

/**
 * @typedef {import('./typedef.js').ServiceState} ServiceState
 * @typedef {import('./typedef.js').StateChangeEvent} StateChangeEvent
 * @typedef {import('./typedef.js').TargetStateChangeEvent} TargetStateChangeEvent
 * @typedef {import('./typedef.js').HealthChangeEvent} HealthChangeEvent
 * @typedef {import('./typedef.js').ServiceErrorEvent} ServiceErrorEvent
 */

/**
 * Base class for all services with lifecycle management
 * @extends EventEmitter
 */
export class ServiceBase extends EventEmitter {

  /** @type {Object<string,any>|null} */
  #lastConfig = null;

  /**
   * Create a new service instance
   *
   * @param {string} name - Service name
   * @param {import('./typedef.js').ServiceOptions} [options]
   */
  // eslint-disable-next-line no-unused-vars
  constructor(name, options) {
    super();

    if( typeof name !== 'string' )
    {
      throw new Error(`Service misses constructor parameter [name]`);
    }

    /** @type {string} */
    this.name = name;

    /** @type {ServiceState} */
    this.state = STATE_CREATED;

    /** @type {ServiceState} */
    this.targetState = STATE_CREATED;

    /** @type {boolean} */
    this.healthy = false;

    /** @type {Error|null} */
    this.error = null;

    /** @type {Logger} */
    this.logger = new Logger(name, INFO);
    // this.logger = new Logger(name, options.logLevel || INFO);

    /** @private @type {number} */
    // this._shutdownTimeout = options.shutdownTimeout || 5000;

    // this.manager = options.manager;
  }

  /**
   * Configure the service with configuration
   *
   * @param {Object<string,any>|null} [config={}]
   *
   * @returns {Promise<import('./typedef.js').OperationResult>} Operation result
   */
  async configure(config = {}) {
    if (
      this.state !== STATE_CREATED &&
      this.state !== STATE_CONFIGURED &&
      this.state !== STATE_RUNNING &&
      this.state !== STATE_STOPPED &&
      this.state !== STATE_DESTROYED
    ) {
      const error = new Error(`Cannot configure from state: ${this.state}`);
      this.logger.warn(error.message);
      return { ok: false, error };
    }

    const wasRunning = this.state === STATE_RUNNING;

    try {
      this._setTargetState(wasRunning ? STATE_RUNNING : STATE_CONFIGURED);
      this._setState(STATE_CONFIGURING);
      this.logger.debug('Configuring service', { config });

      await this._configure(config, this.#lastConfig);
      this.#lastConfig = config;

      this._setState(wasRunning ? STATE_RUNNING : STATE_CONFIGURED);
      this.logger.info('Service configured');
      return { ok: true };
    } catch (error) {
      this._setError('configuration', /** @type {Error} */ (error));
      return { ok: false, error: this.error };
    }
  }

  /**
   * Get the last applied config
   *
   * @returns {Object<string,any>} config
   */
  get lastConfig() {
    return { ...this.#lastConfig };
  }

  /**
   * Start the service
   *
   * @returns {Promise<import('./typedef.js').OperationResult>} Operation result
   */
  async start() {
    if (this.state !== STATE_CONFIGURED && this.state !== STATE_STOPPED) {
      const error = new Error(`Cannot start from state: ${this.state}`);
      this.logger.warn(error.message);
      return { ok: false, error };
    }

    try {
      this._setTargetState(STATE_RUNNING);
      this._setState(STATE_STARTING);
      this.logger.debug('Starting service');

      await this._start();

      this._setState(STATE_RUNNING);
      this._setHealthy(true);
      this.logger.info('Service started');
      return { ok: true };
    } catch (error) {
      this._setError('startup', /** @type {Error} */ (error));
      return { ok: false, error: this.error };
    }
  }

  /**
   * Stop the service with optional timeout
   *
   * @param {import('./typedef.js').StopOptions} [options={}] - Stop options
   *
   * @returns {Promise<import('./typedef.js').OperationResult>} Operation result
   */
  async stop(options = {}) {
    if (this.state !== STATE_RUNNING && this.state !== STATE_ERROR) {
      this.logger.warn(`Cannot stop from state: ${this.state}`);
      return { ok: true }; // Already stopped
    }

    const timeout = options.timeout ?? this._shutdownTimeout;

    try {
      this._setTargetState(STATE_STOPPED);
      this._setState(STATE_STOPPING);
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

      this._setState(STATE_STOPPED);
      this.logger.info('Service stopped');
      return { ok: true };
    } catch (error) {
      if (
        /** @type {Error} */ (error).message === 'Shutdown timeout' &&
        options.force
      ) {
        this.logger.warn('Forced shutdown after timeout');
        this._setState(STATE_STOPPED);
        return { ok: true };
      }
      this._setError('shutdown', /** @type {Error} */ (error));
      return { ok: false, error: this.error };
    }
  }

  /**
   * Recover the service from error state
   *
   * @returns {Promise<import('./typedef.js').OperationResult>} Operation result
   */
  async recover() {
    if (this.state !== STATE_ERROR) {
      const error = new Error(
        `Can only recover from ERROR state, current: ${this.state}`
      );
      this.logger.warn(error.message);
      return { ok: false, error };
    }

    try {
      this._setTargetState(STATE_RUNNING);
      this._setState(STATE_RECOVERING);
      this.logger.info('Attempting recovery');

      // Try custom recovery first
      if (this._recover) {
        await this._recover();
        this._setState(STATE_RUNNING);
        this._setHealthy(true);
      } else {
        // Default: restart
        this._setState(STATE_STOPPED);
        const startResult = await this.start();
        if (!startResult.ok) {
          return startResult; // Forward the start error
        }
      }

      this.error = null;
      this.logger.info('Recovery successful');
      return { ok: true };
    } catch (error) {
      this._setError('recovery', /** @type {Error} */ (error));
      return { ok: false, error: this.error };
    }
  }

  /**
   * Destroy the service and cleanup resources
   *
   * @returns {Promise<import('./typedef.js').OperationResult>} Operation result
   */
  async destroy() {
    if (this.state === STATE_DESTROYED) {
      return { ok: true };
    }

    try {
      if (this.state === STATE_RUNNING) {
        const stopResult = await this.stop();
        if (!stopResult.ok) {
          return stopResult; // Forward the stop error
        }
      }

      this._setTargetState(STATE_DESTROYED);
      this._setState(STATE_DESTROYING);
      this.logger.debug('Destroying service');

      if (this._destroy) {
        await this._destroy();
      }

      this._setState(STATE_DESTROYED);
      this._setHealthy(false);
      this.logger.info('Service destroyed');

      // Cleanup
      this.removeAllListeners();
      this.logger.removeAllListeners();

      return { ok: true };
    } catch (error) {
      this._setError('destruction', /** @type {Error} */ (error));
      return { ok: false, error: this.error };
    }
  }

  /**
   * Get the current health status of the service
   *
   * @returns {Promise<import('./typedef.js').HealthStatus>}
   *   Health status object
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
          checkError: /** @type {Error} */ (error).message
        };
      }
    }

    return baseHealth;
  }

  /**
   * Set the service log level
   *
   * @param {import('$lib/logging/typedef.js').LogLevel} level - New log level
   *
   * @returns {boolean} True if the level was set successfully
   */
  setLogLevel(level) {
    return this.logger.setLevel(level);
  }

  // Protected methods to override in subclasses

  /**
   * Configure the service (handles both initial config and reconfiguration)
   *
   * @protected
   * @param {any} newConfig - Configuration to apply
   * @param {any} [oldConfig=null] - Previous config (null = initial setup)
   *
   * @returns {Promise<void>}
   *
   * @remarks
   * This method is called both for initial setup and reconfiguration.
   * When oldConfig is provided, you should:
   * 1. Compare oldConfig vs newConfig to determine changes
   * 2. Clean up resources that need replacing
   * 3. Apply only the changes that are necessary
   * 4. Preserve resources that don't need changing
   *
   * @example
   * async _configure(newConfig, oldConfig = null) {
   *   if (!oldConfig) {
   *     // Initial setup
   *     this.connection = new Connection(newConfig.url);
   *     return;
   *   }
   *
   *   // Reconfiguration
   *   if (oldConfig.url !== newConfig.url) {
   *     await this.connection.close();
   *     this.connection = new Connection(newConfig.url);
   *   }
   * }
   */
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig = null) {
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

  /**
   * Set the service state and emit event
   *
   * @protected
   *
   * @param {ServiceState} newState - New state value
   * @emits {StateChangeEvent} EVENT_STATE_CHANGED
   */
  _setState(newState) {
    const oldState = this.state;
    this.state = newState;

    /** @type {StateChangeEvent} */
    const eventData = {
      service: this.name,
      oldState,
      newState
    };

    this.emit(EVENT_STATE_CHANGED, eventData);
  }

  /**
   * Set the service target state and emit event
   *
   * @protected
   *
   * @param {ServiceState} newTargetState - New target state value
   * @emits {TargetStateChangeEvent} EVENT_TARGET_STATE_CHANGED
   */
  _setTargetState(newTargetState) {
    const oldTargetState = this.targetState;
    this.targetState = newTargetState;

    /** @type {TargetStateChangeEvent} */
    const eventData = {
      oldTargetState,
      newTargetState
    };

    this.emit(EVENT_TARGET_STATE_CHANGED, eventData);
  }

  /**
   * Set the health status and emit event if changed
   *
   * @protected
   *
   * @param {boolean} healthy - New health status
   * @emits {HealthChangeEvent} EVENT_HEALTH_CHANGED
   */
  _setHealthy(healthy) {
    const wasHealthy = this.healthy;
    this.healthy = healthy;

    if (wasHealthy !== healthy) {
      /** @type {HealthChangeEvent} */
      const eventData = {
        healthy,
        wasHealthy
      };

      this.emit(EVENT_HEALTH_CHANGED, eventData);
    }
  }

  /**
   * Set error state and emit error event
   *
   * @protected
   *
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error that occurred
   * @emits {ServiceErrorEvent} EVENT_ERROR
   */
  _setError(operation, error) {
    const detailedError = new DetailedError(`${operation} failed`, null, error);

    this.error = detailedError;
    this._setState(STATE_ERROR);
    this._setHealthy(false);

    this.logger.error(detailedError);

    /** @type {ServiceErrorEvent} */
    const eventData = {
      operation,
      error: detailedError
    };

    this.emit(EVENT_ERROR, eventData);
  }
}

export default ServiceBase;
