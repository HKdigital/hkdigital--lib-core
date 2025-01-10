import {
  NetworkLoader,
  ERROR_NOT_LOADED,
  ERROR_TRANSFERRED
} from '$lib/classes/svelte/network-loader/index.js';

/**
 * ImageLoader instance
 * - Loads image data from network
 * - The loading process can be monitored
 */
export default class ImageLoader extends NetworkLoader {} // end class
