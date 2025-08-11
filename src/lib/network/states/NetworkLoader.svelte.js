import { CONTENT_TYPE } from '$lib/constants/http/index.js';

import { LoadingStateMachine } from '$lib/state/classes.js';

import {
  STATE_INITIAL,
  STATE_LOADING,
  STATE_UNLOADING,
  STATE_LOADED,
  STATE_CANCELLED,
  STATE_ERROR,
  LOAD,
  ERROR,
  LOADED,
  UNLOAD,
  INITIAL
} from '$lib/state/classes/loading-state-machine/constants.js';

import * as expect from '$lib/util/expect/index.js';

import { httpGet, loadResponseBuffer } from '$lib/network/http.js';

import { ERROR_NOT_LOADED, ERROR_TRANSFERRED } from './constants.js';

/**
 * NetworkLoader instance
 * - Loads network data from network into an ArrayBuffer
 * - Loaded data can be transferred to an AudioBufferSourceNode
 */
export default class NetworkLoader {
  // _state = $state(new LoadingStateMachine());
  _state = new LoadingStateMachine();

  state = $derived.by(() => {
    return this._state.current;
  });

  initial = $derived.by(() => {
    return this._state.current === STATE_INITIAL;
  });

  loaded = $derived.by(() => {
    return this._state.current === STATE_LOADED;
  });

  /** @type {string|null} */
  _url = null;

  /** @type {number}  */
  _bytesLoaded = $state(0);

  /** @type {number}  */
  _size = $state(0);

  /**
   * Response headers
   * @type {Headers|null}
   */
  _headers = $state(null);

  /** @type {ArrayBuffer|null} */
  _buffer = null;

  // Export state property as readonly

  /** @type {import('./typedef.js').LoadingProgress} */
  progress = $derived.by(() => {
    return {
      bytesLoaded: this._bytesLoaded,
      size: this._size,
      loaded: this.loaded
    };
  });

  /** @type {null|(()=>void)} */
  _abortLoading = null;

  /**
   * Construct NetworkLoader
   *
   * @param {object} _
   * @param {string} _.url
   */
  constructor({ url }) {
    expect.absOrRelUrl(url);

    this._url = url;

    const state = this._state;
    // const progress = this.progress;

    //
    // ISSUE: $effect is not triggered by  this._state changes,
    //        using onenter instead
    //
    this._state.onenter = () => {
      switch (state.current) {
        case STATE_LOADING:
          {
            // console.log('**** NetworkLoader:loading');
            this.#load();
          }
          break;

        case STATE_UNLOADING:
          {
            // console.log('NetworkLoader:unloading');
            this.#unload();
          }
          break;

        case STATE_LOADED:
          {
            // console.debug('NetworkLoader:loaded', $state.snapshot(state));

            // setTimeout(() => {
            //   console.debug(
            //     'NetworkLoader:loaded',
            //     $state.snapshot(state),
            //     progress
            //   );
            // }, 500);

            // Abort function is no longer needed
            this._abortLoading = null;
          }
          break;

        case STATE_CANCELLED:
          {
            // console.log('NetworkLoader:cancelled');
            // TODO
          }
          break;

        case STATE_ERROR:
          {
            console.log('NetworkLoader:error', state.error);
          }
          break;
      } // end switch
    };
  }

  /**
   * Start loading all network data
   */
  load() {
    // console.debug('NetworkLoader: load() called');
    this._state.send(LOAD);
  }

  /**
   * Unoad all network data
   */
  unload() {
    this._state.send(UNLOAD);
  }

  /**
   * Get network data size in bytes
   * - Info comes from the content length response header
   *
   * @returns {number}
   */
  get size() {
    return this._size;
  }

  /**
   * Get content type from response header
   *
   * @returns {string|null}
   */
  getContentType() {
    if (!this._headers) {
      throw new Error(ERROR_NOT_LOADED);
    }

    return this._headers.get(CONTENT_TYPE);
  }

  /**
   * Get data as array buffer
   *
   * @note If the data has been transferred, the data is
   *       no longer available as ArrayBuffer
   *
   * @returns {ArrayBuffer}
   */
  getArrayBuffer() {
    if (!this._buffer) {
      throw new Error(ERROR_NOT_LOADED);
    }

    if (this._buffer.detached) {
      throw new Error(ERROR_TRANSFERRED);
    }

    return this._buffer;
  }

  /**
   * Get data as Uint8Array
   *
   * @returns {Uint8Array}
   */
  getUint8Array() {
    return new Uint8Array(this.getArrayBuffer());
  }

  /**
   * Get data as Blob
   * - The Blob type is set using the response header
   *   content type
   *
   * @returns {Blob}
   */
  getBlob() {
    const type = this.getContentType();

    const options = {};

    if (type) {
      options.type = type;
    }

    return new Blob([this.getArrayBuffer()], options);
  }

  /**
   * Get object URL
   *
   * @note the objectURL should be revoked when no longer used
   *
   * @returns {string}
   */
  getObjectURL() {
    //
    // Example usage:
    //
    // $effect(() => {
    //   if (loader.loaded) {
    //     // @ts-ignore
    //     objectUrl = loader.getObjectURL();
    //   }
    //
    //   return () => {
    //     if (objectUrl) {
    //       URL.revokeObjectURL(objectUrl);
    //       objectUrl = null;
    //     }
    //   };
    // });

    return URL.createObjectURL(this.getBlob());
  }

  /**
   * Internal method that initializes the loading process
   * and transitions to state LOADED when done
   */
  async #load() {
    try {
      // console.log('>>>> NetworkLoader:#load', this._url);

      if (this._abortLoading) {
        // console.log('Abort loading');
        this._abortLoading();
        this._abortLoading = null;
      }

      /** @type {()=>void} */
      let abortRequest;

      /**
       * @param {object} _
       * @param {()=>void} _.abort
       */
      const requestHandler = ({ abort }) => {
        abortRequest = abort;
      };

      this._bytesLoaded = 0;
      this._size = 0;

      // @ts-ignore
      const response = await httpGet({ url: this._url, requestHandler });

      this._headers = response.headers;

      // console.log('headers', this._headers);
      // console.log('response', response);

      const { bufferPromise, abort: abortLoadBody } = loadResponseBuffer(
        response,
        ({ bytesLoaded, size }) => {
          this._bytesLoaded = bytesLoaded;
          this._size = size;
        }
      );

      this._abortLoading = () => {
        abortRequest();
        abortLoadBody();
      };

      this._buffer = await bufferPromise;

      // console.debug('#load', this._buffer, this._bytesLoaded);

      this._state.send(LOADED);
    } catch (e) {
      this._state.send(ERROR, e);
    }
  }

  /**
   * Internal method that initializes the unloading process
   * and transitions to state INITIAL when done
   */
  async #unload() {
    try {
      if (this._abortLoading) {
        this._abortLoading();
        this._abortLoading = null;
      }

      this._bytesLoaded = 0;
      this._size = 0;
      this._headers = null;
      this._buffer = null;

      this._state.send(INITIAL);
    } catch (e) {
      this._state.send(ERROR, e);
    }
  }
} // end class
