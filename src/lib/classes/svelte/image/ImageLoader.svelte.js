import {
  NetworkLoader
  // ERROR_NOT_LOADED,
  // ERROR_TRANSFERRED
} from '$lib/classes/svelte/network-loader/index.js';

/**
 * ImageLoader instance
 * - Loads image data from network
 * - The loading process can be monitored
 */
export default class ImageLoader extends NetworkLoader {
  // onenter(label) {
  //   console.log('ImageLoader:onenter', label);
  // }

  // constructor({ url }) {
  //   super({ url });

  //   $effect(() => {
  //     console.log('ImageLoader: state', this.state);
  //   });
  // }

  get url() {
    return this._url;
  }

  //
  // /**
  //  * Construct ImageLoader
  //  *
  //  * @param {object} _
  //  * @param {string} _.url
  //  */
  // constructor( { url } ) {}
  //
  // /**
  //  * Get object URL that can be used as src parameter of an HTML image
  //  *
  //  * @note the objectURL should be revoked when no longer used
  //  */
  // getObjectURL() {}
  //
} // end class
