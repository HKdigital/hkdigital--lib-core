/** @typedef {import('./typedef.js').ImageMeta} ImageMeta */

import * as expect from '$lib/util/expect.js';

import SceneBase from '../base/SceneBase.svelte.js';
import ImageLoader from './ImageLoader.svelte.js';

/**
 * @typedef {object} ImageSceneSource
 * @property {string} label
 * @property {ImageLoader} imageLoader
 */

export default class ImageScene extends SceneBase {

  /** @type {ImageSceneSource[]} */
  #imageSources = $state([]);


  /**
   * Construct ImageScene
   */
  constructor() {
    super();
  }

  /* ==== SceneBase implementation */

  /**
   * Get the array of image sources managed by this scene
   *
   * @returns {ImageSceneSource[]}
   */
  get sources() {
    return this.#imageSources;
  }

  /**
   * Extract the image loader from a source object
   *
   * @param {ImageSceneSource} source
   *
   * @returns {ImageLoader}
   */
  getLoaderFromSource(source) {
    return source.imageLoader;
  }

  /* ==== Source definitions */

  /**
   * Add image source
   * - Uses an ImageLoader instance to load image data from network
   *
   * @param {object} _
   * @param {string} _.label
   * @param {import('$lib/config/typedef.js').ImageSource} _.imageSource
   */
  defineImage({ label, imageSource }) {
    expect.notEmptyString(label);

    // expect.notEmptyString(url);

    const imageLoader = new ImageLoader(imageSource);

    this.#imageSources.push({ label, imageLoader });
  }

  /* ==== Resource access */

  /**
   * Get an image loader
   *
   * @param {string} label
   *
   * @returns {ImageLoader}
   */
  getImageLoader(label) {
    const source = this.#getImageSceneSource(label);

    return source.imageLoader;
  }

  /**
   * Get object URL that can be used as src parameter of an HTML image
   *
   * @param {string} label
   *
   * @returns {ImageMeta}
   */
  getImageMeta(label) {
    const source = this.#getImageSceneSource(label);

    return source.imageLoader.imageMeta;
  }

  /**
   * Get object URL that can be used as src parameter of an HTML image
   *
   * @param {string} label
   *
   * @note the objectURL should be revoked when no longer used
   *
   * @returns {string}
   */
  getObjectURL(label) {
    const source = this.#getImageSceneSource(label);

    return source.imageLoader.getObjectURL();
  }

  /* ==== Internals */

  /**
   * Get Image source
   *
   * @param {string} label
   *
   * @returns {ImageSceneSource}
   */
  #getImageSceneSource(label) {
    for (const source of this.#imageSources) {
      if (label === source.label) {
        return source;
      }
    }

    throw new Error(`Source [${label}] has not been defined`);
  }
} // end class
