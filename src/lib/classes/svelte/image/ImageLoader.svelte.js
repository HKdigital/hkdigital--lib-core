/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import { toSingleImageMeta } from '$lib/util/image/index.js';

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
   * @param {ImageMeta|ImageMeta[]} _.imageMeta
   */
  constructor({ imageMeta }) {
    imageMeta = toSingleImageMeta(imageMeta);

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
