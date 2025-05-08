/**
 * @fileoverview Base service class with lifecycle management and logging.
 *
 * ServiceBase provides a standardized lifecycle (initialize, start, stop,
 * destroy) with state transitions, error handling, and integrated logging.
 * Services should extend this class and override the protected _init, _start,
 * _stop, and _destroy methods to implement their specific functionality.
 *
 * @example
 * // Creating a service
 * import { ServiceBase } from './ServiceBase.js';
 *
 * class DatabaseService extends ServiceBase {
 *   constructor() {
 *     super('database');
 *     this.connection = null;
 *   }
 *
 *   async _init(config) {
 *     this.config = config;
 *     this.logger.debug('Database configured', { config });
 *   }
 *
 *   async _start() {
 *     this.connection = await createConnection(this.config);
 *     this.logger.info('Database connected', { id: this.connection.id });
 *   }
 *
 *   async _stop() {
 *     await this.connection.close();
 *     this.connection = null;
 *     this.logger.info('Database disconnected');
 *   }
 * }
 *
 * // Using a service
 * const db = new DatabaseService();
 *
 * await db.initialize({ host: 'localhost', port: 27017 });
 * await db.start();
 *
 * // Listen for state changes
 * db.on('stateChanged', ({ oldState, newState }) => {
 *   console.log(`Database service: ${oldState} -> ${newState}`);
 * });
 *
 * // Later...
 * await db.stop();
 * await db.destroy();
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
} from './constants';

/**
 * Base class for all services
 */
export default class ServiceBase {
  /**
   * Create a new service
   *
   * @param {string} name - Service name
   * @param {Object} [options] - Service options
   * @param {string} [options.logLevel=INFO] - Initial log level
   */
  constructor(name, options = {}) {
    /**
     * Service name
     * @type {string}
     */
    this.name = name;

    /**
     * Event emitter for service events
     * @type {EventEmitter}
     */
    this.events = new EventEmitter();

    /**
     * Current service state
     * @type {string}
     */
    this.state = CREATED;

    /**
     * Last error that occurred
     * @type {Error|null}
     */
    this.error = null;

    /**
     * Last stable state before error
     * @type {string|null}
     * @private
     */
    this._preErrorState = null;

    /**
     * Service logger
     * @type {Logger}
     */
    this.logger = new Logger(name, options.logLevel || INFO);

    // Set the initial state through _setState to ensure
    // the event is emitted consistently
    this._setState(CREATED);
  }

  /**
   * Set the service log level
   *
   * @param {string} level - New log level
   * @returns {boolean} True if level was set, false if invalid
   */
  setLogLevel(level) {
    return this.logger.setLevel(level);
  }

  /**
   * Initialize the service
   *
   * @param {Object} [config] - Service configuration
   * @returns {Promise<boolean>} True if initialized successfully
   */
  async initialize(config = {}) {
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
   * @returns {Promise<boolean>} True if started successfully
   */
  async start() {
    // Check if service can be started
    if (this.state !== INITIALIZED && this.state !== STOPPED) {
      this._setError(
        'startup',
        new Error(`Cannot start service in state: ${this.state}`)
      );
      return false;
    }

    try {
      this._setState(STARTING);
      this.logger.debug('Starting service');

      await this._start();

      this._setState(RUNNING);
      this.logger.info('Service started');
      return true;
    } catch (error) {
      this._setError('startup', error);
      return false;
    }
  }

  /**
   * Stop the service
   *
   * @returns {Promise<boolean>} True if stopped successfully
   */
  async stop() {
    // Check if service can be stopped
    if (this.state !== RUNNING) {
      this._setError(
        'stopping',
        new Error(`Cannot stop service in state: ${this.state}`)
      );
      return false;
    }

    try {
      this._setState(STOPPING);
      this.logger.debug('Stopping service');

      await this._stop();

      this._setState(STOPPED);
      this.logger.info('Service stopped');
      return true;
    } catch (error) {
      this._setError('stopping', error);
      return false;
    }
  }

  /**
   * Recover the service
   *
   * @returns {Promise<boolean>} True if stopped successfully
   */
  async recover() {
  if (this.state !== ERROR) {
    this.logger.warn(`Can only recover from ERROR state, current state: ${this.state}`);
    return false;
  }

  try {
    this._setState(RECOVERING);
    this.logger.info('Attempting service recovery');

    const targetState = this._preErrorState;

    // Allow service-specific recovery logic
    await this._recover();

    // this._setState(targetState);
    if( this.state !== ERROR )
    {
      // Clear
      this._preErrorState = null;
    }

    // Clear error
    this.error = null;


    // If recovery successful, return to initialized state
    this._setState(INITIALIZED);
    this.logger.info('Service recovery successful');


    return true;
  } catch (error) {
    this._setError('recovery', error);
    return false;
  }
}

  /**
   * Destroy the service
   *
   * @returns {Promise<boolean>} True if destroyed successfully
   */
  async destroy() {
    try {
      this._setState(DESTROYING);
      this.logger.debug('Destroying service');

      await this._destroy();

      this._setState(DESTROYED);
      this.logger.info('Service destroyed');

      // Clean up event listeners
      this.events.removeAllListeners();
      this.logger.removeAllListeners();

      return true;
    } catch (error) {
      this._setError('destruction', error);
      return false;
    }
  }

  /**
   * Add an event listener
   *
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(eventName, handler) {
    return this.events.on(eventName, handler);
  }

  /**
   * Emit an event
   *
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   * @returns {boolean} True if event had listeners
   */
  emit(eventName, data) {
    return this.events.emit(eventName, data);
  }

  // Protected methods to be overridden by subclasses

  /**
   * Initialize the service (to be overridden)
   *
   * @protected
   * @param {Object} config - Service configuration
   * @returns {Promise<void>}
   */
  async _init(config) {
    // Default implementation does nothing
  }

  /**
   * Start the service (to be overridden)
   *
   * @protected
   * @returns {Promise<void>}
   */
  async _start() {
    // Default implementation does nothing
  }

  /**
   * Stop the service (to be overridden)
   *
   * @protected
   * @returns {Promise<void>}
   */
  async _stop() {
    // Default implementation does nothing
  }

  /**
   * Destroy the service (to be overridden)
   *
   * @protected
   * @returns {Promise<void>}
   */
  async _destroy() {
    // Default implementation does nothing
  }

  /**
   * Recover the service from an error (to be overridden)
   *
   * @protected
   * @returns {Promise<void>}
   */
  async _recover() {
    // @note the user implementation is responsible for setting the target state
    this._setState( this._preErrorState );
  }

  // Private helper methods

  /**
   * Set the service state
   *
   * @private
   * @param {string} state - New state
   */
  _setState(state) {
    const oldState = this.state;
    this.state = state;

    this.logger.debug(`State changed from ${oldState} to ${state}`);

    this.events.emit('stateChanged', {
      service: this.name,
      oldState,
      newState: state
    });
  }

  /**
   * Set an error state
   *
   * @private
   * @param {string} operation - Operation that failed
   * @param {Error} error - Error that occurred
   */
  _setError(operation, error) {

    if (this.state !== ERROR) {
      // Store current state before transitioning to ERROR
      this._preErrorState = this.state;
    }

    this.error = error;
    this._setState(ERROR);

    this.logger.error(`${operation} error`, {
      error: error.message,
      stack: error.stack
    });

    this.events.emit('error', {
      service: this.name,
      operation,
      error
    });
  }
}
