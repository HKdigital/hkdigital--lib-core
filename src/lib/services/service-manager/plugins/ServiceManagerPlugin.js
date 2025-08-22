import { EventEmitter } from '$lib/generic/events.js';

/**
 * Base class for ServiceManager plugins
 */
export default class ServiceManagerPlugin extends EventEmitter {
  constructor( manager, options ) {
    super();
    this.manager = manager;
    this.options = options;
  }

  // /**
  //  * Attach plugin to ServiceManager
  //  * @param {ServiceManager} manager
  //  */
  // attach(manager) {
  //   if (this.manager) {
  //     throw new Error(`Plugin '${this.name}' already attached`);
  //   }

  //   this.manager = manager;
  //   this._onAttach(manager);
  // }
}
