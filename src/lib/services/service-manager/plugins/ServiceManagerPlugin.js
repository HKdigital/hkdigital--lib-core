/**
 * @fileoverview Base class for ServiceManager plugins that can extend
 * service management functionality.
 *
 * ServiceManagerPlugin provides a standardized interface for plugins to
 * hook into ServiceManager operations, particularly configuration resolution.
 *
 * @example
 * // Basic plugin implementation
 * import ServiceManagerPlugin from './ServiceManagerPlugin.js';
 *
 * class ConfigServicePlugin extends ServiceManagerPlugin {
 *   constructor() {
 *     super('config');
 *     this.#configs = new Map();
 *   }
 *
 *   async getServiceConfig(serviceName, serviceEntry, currentConfig) {
 *     if (typeof currentConfig === 'string') {
 *       // currentConfig is a config label - resolve it
 *       return this.#configs.get(currentConfig);
 *     }
 *     return undefined; // Use currentConfig as-is
 *   }
 * }
 *
 * // Usage
 * const manager = new ServiceManager();
 * const configPlugin = new ConfigServicePlugin();
 * manager.attach(configPlugin);
 */

import { EventEmitter } from '$lib/generic/events.js';

/**
 * @typedef {import('../typedef.js').ServiceEntry} ServiceEntry
 */

/**
 * Base class for ServiceManager plugins
 * @extends EventEmitter
 */
export default class ServiceManagerPlugin extends EventEmitter {
  /**
   * Create a new plugin instance
   *
   * @param {string} name - Unique plugin identifier
   */
  constructor(name) {
    super();

    if (!name || typeof name !== 'string') {
      throw new Error('Plugin name is required and must be a string');
    }

    /** @type {string} */
    this.name = name;

    /** @type {import('../ServiceManager.js').ServiceManager|null} */
    this.manager = null;
  }

  /**
   * Attach this plugin to a ServiceManager instance
   *
   * @param {import('../ServiceManager.js').ServiceManager} manager
   *   ServiceManager instance
   *
   * @throws {Error} If plugin is already attached to a manager
   */
  attach(manager) {
    if (this.manager) {
      throw new Error(
        `Plugin '${this.name}' is already attached to a ServiceManager`
      );
    }

    this.manager = manager;
    this._onAttach();
  }

  /**
   * Detach this plugin from its ServiceManager
   */
  detach() {
    if (this.manager) {
      this._onDetach();
      this.manager = null;
    }
  }

  /**
   * Resolve service configuration (called during service configuration)
   *
   * This method allows plugins to transform or resolve service configuration
   * before it's applied to the service. It's particularly useful for config
   * plugins that need to resolve config labels to actual config objects.
   *
   * @param {string} serviceName - Name of the service being configured
   * @param {ServiceEntry} serviceEntry - Full service registration entry
   * @param {*} currentConfig - Current config (object or string label)
   *
   * @returns {Promise<*|undefined>}
   *   Resolved config object, or undefined to use currentConfig as-is
   *
   * @example
   * async getServiceConfig(serviceName, serviceEntry, currentConfig) {
   *   if (typeof currentConfig === 'string') {
   *     // Resolve config label
   *     return await this.loadConfigFromLabel(currentConfig);
   *   }
   *   return undefined; // Use static config object
   * }
   */
  // eslint-disable-next-line no-unused-vars
  async _getServiceConfig(serviceName, serviceEntry, currentConfig) {
    // Override in subclass
    return undefined;
  }

  // ... other overrideable methods may follow

  /**
   * Called when plugin is attached to a ServiceManager
   *
   * @protected
   */
  _onAttach() {
    // Override in subclass if needed
    // Note: Use this for initialization that requires manager access
  }

  /**
   * Called when plugin is detached from a ServiceManager
   *
   * @protected
   */
  _onDetach() {
    // Override in subclass if needed
    // Note: Use this for cleanup when detaching
  }
}
