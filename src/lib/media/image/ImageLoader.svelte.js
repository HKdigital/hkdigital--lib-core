/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import { toSingleImageMeta } from './utils/index.js';

import {
  NetworkLoader
} from '$lib/classes/svelte/network-loader/index.js';

/**
 * ImageLoader instance
 * - Loads image data from network
 * - The loading process can be monitored
 */
export default class ImageLoader extends NetworkLoader {
  /** @type {ImageMeta} */
  #imageMeta;

  /**
   * @param {object} _
   * @param {import('../typedef.js').ImageSource} _.imageSource
   */
  constructor({ imageSource }) {
    const imageMeta = toSingleImageMeta(imageSource);

    super({ url: imageMeta.src });

    this.#imageMeta = imageMeta;
  }

  get imageMeta() {
    return this.#imageMeta;
  }

  get url() {
    return this._url;
  }

  // /**
  //  * Get object URL that can be used as src parameter of an HTML image
  //  *
  //  * @note the objectURL should be revoked when no longer used
  //  */
  // getObjectURL() {}
  //
} // end class
