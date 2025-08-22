/**
 * @fileoverview Object-based configuration plugin for ServiceManager
 *
 * Resolves service configuration from a pre-provided configuration object
 * using config labels that map to object properties or prefixed keys.
 *
 * @example
 * // Basic usage with config object
 * import ObjectConfigPlugin from '$lib/services/service-manager-plugins/ObjectConfigPlugin.js';
 *
 * const configObject = {
 *   'database': { host: 'localhost', port: 5432 },
 *   'auth': { secret: 'my-secret', algorithm: 'HS256' }
 * };
 *
 * const objectPlugin = new ObjectConfigPlugin(configObject);
 * manager.attachPlugin(objectPlugin);
 *
 * @example
 * // With environment variables using utility
 * import { allEnv } from '$lib/util/sveltekit/env.js';
 * import ObjectConfigPlugin from '$lib/services/service-manager-plugins/ObjectConfigPlugin.js';
 *
 * const envConfig = await allEnv();
 * const envPlugin = new ObjectConfigPlugin(envConfig, {
 *   prefixMap: {
 *     'database': 'DATABASE',
 *     'auth': 'JWT'
 *   }
 * });
 *
 * @example
 * // Mixed configuration sources
 * const mixedConfig = {
 *   ...await allEnv(),
 *   'custom-service': { specialOption: true },
 *   'override-service': { host: 'custom-host' }
 * };
 * const mixedPlugin = new ObjectConfigPlugin(mixedConfig);
 */

import ServiceManagerPlugin from '../service-manager/plugins/ServiceManagerPlugin.js';

/**
 * Plugin that resolves service configuration from a configuration object
 * @extends ServiceManagerPlugin
 */
export default class ObjectConfigPlugin extends ServiceManagerPlugin {

  /**
   * Create a new object configuration plugin
   *
   * @param {Object<string, *>} configObject - Pre-parsed configuration object
   */
  constructor(configObject) {
    super('object-config');

    /** @type {Object<string, *>} */
    this.configObject = configObject || {};
  }

  /**
   * Resolve service configuration from the configuration object
   *
   * @param {string} serviceName - Name of the service being configured
   * @param {import('../service-manager/typedef.js').ServiceEntry} serviceEntry
   *   Service registration entry
   * @param {*} currentConfig - Current config (could be object from previous plugins)
   *
   * @returns {Promise<Object|undefined>}
   *   Resolved config object, or undefined to use currentConfig as-is
   */
  // eslint-disable-next-line no-unused-vars
  async _getServiceConfig(serviceName, serviceEntry, currentConfig) {
    // Only handle string config labels from original registration
    if (typeof serviceEntry.config !== 'string') {
      return undefined;
    }

    const configLabel = serviceEntry.config;

    // Simple object lookup
    const config = this.configObject[configLabel];

    if (config !== undefined) {
      this.manager?.logger?.debug(
        `Resolved object config for '${serviceName}' (label: ${configLabel})`,
        {
          configKeys:
            typeof config === 'object' ? Object.keys(config) : 'primitive'
        }
      );
    }

    return config;
  }

  /**
   * Update the configuration object
   *
   * @param {Object<string, *>} newConfigObject - New configuration object
   */
  updateConfigObject(newConfigObject) {
    this.configObject = newConfigObject || {};
    this.manager?.logger?.debug('Updated configuration object');
  }

  /**
   * Merge additional configuration into the existing object
   *
   * @param {Object<string, *>} additionalConfig - Additional configuration
   */
  mergeConfig(additionalConfig) {
    this.configObject = { ...this.configObject, ...additionalConfig };
    this.manager?.logger?.debug('Merged additional configuration');
  }

  /**
   * Get the current configuration object
   *
   * @returns {Object<string, *>} Current configuration object
   */
  getConfigObject() {
    return { ...this.configObject };
  }

  /**
   * Update config for a specific label and push to affected services
   *
   * @param {string} configLabel - Config label to update
   * @param {*} newConfig - New configuration value
   *
   * @returns {Promise<string[]>} Array of service names that were updated
   */
  async updateConfigLabel(configLabel, newConfig) {
    // Update the config object
    this.configObject[configLabel] = newConfig;

    const updatedServices = [];

    // Find all services using this config label
    for (const [serviceName, serviceEntry] of this.manager.services) {
      if (serviceEntry.config === configLabel && serviceEntry.instance) {
        try {
          // Call _configure on the service instance if it exists
          if (typeof serviceEntry.instance._configure === 'function') {
            await serviceEntry.instance._configure(newConfig, 
              serviceEntry.resolvedConfig);
            serviceEntry.resolvedConfig = newConfig;
            updatedServices.push(serviceName);

            this.manager.logger.info(
              `Updated config for service '${serviceName}' (label: ${configLabel})`
            );
          }
        } catch (error) {
          this.manager.logger.error(
            `Failed to update config for service '${serviceName}': ${error.message}`
          );
        }
      }
    }

    this.manager.logger.debug(
      `Config label '${configLabel}' updated, affected ${updatedServices.length} services`
    );

    return updatedServices;
  }

  /**
   * Called when plugin is attached to ServiceManager
   *
   * @protected
   */
  _onAttach() {
    const configKeys = Object.keys(this.configObject).length;

    this.manager.logger.info(
      `ObjectConfigPlugin attached with ${configKeys} config keys`
    );
  }

  /**
   * Called when plugin is detached from ServiceManager
   *
   * @protected
   */
  _onDetach() {
    this.manager.logger.info('ObjectConfigPlugin detached');
  }
}
