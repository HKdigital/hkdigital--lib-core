export { default as ServiceBase } from './service-base/ServiceBase.js';
export { default as ServiceManager } from './service-manager/ServiceManager.js';

export * from './service-base/constants.js';
export * from './service-manager/constants.js';

/**
 * Create a getService function with a preset manager
 *
 * @param {import('./service-manager/ServiceManager.js').default} manager
 *   ServiceManager instance to use
 *
 * @returns {<T>(serviceName: string) => T} getService function with preset manager
 */
export function createGetService(manager) {
  /**
   * Get a typed service instance from the preset manager
   *
   * @template T
   * @param {string} serviceName - Name of the service to retrieve
   *
   * @returns {T} The service instance cast to the specified type
   *
   * @throws {Error} If service is not found
   */
  return function getService(serviceName) {
    const service = manager.get(serviceName);

    if (!service) {
      throw new Error(`Service [${serviceName}] not found`);
    }

    return /** @type {T} */ (service);
  };
}
