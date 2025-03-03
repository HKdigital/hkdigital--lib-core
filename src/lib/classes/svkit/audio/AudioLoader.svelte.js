import {
  NetworkLoader,
  ERROR_NOT_LOADED,
  ERROR_TRANSFERRED
} from '$lib/classes/svkit/network-loader/index.js';

/**
 * AudioLoader instance
 * - Loads audio data from network into an ArrayBuffer
 * - Loaded data can be transferred to an AudioBufferSourceNode
 */
export default class AudioLoader extends NetworkLoader {
  /** @type {AudioBuffer|null} */
  #audioBuffer = null;

  /**
   * Get an AudioBufferSourceNode instance
   *
   * @note AudioBufferSourceNodes can play only once, a new source node
   *       must be created otherwise
   *
   * @param {AudioContext} audioContext
   *
   * @returns {Promise<AudioBufferSourceNode>}
   */
  async getAudioBufferSourceNode(audioContext) {
    if (!this.#audioBuffer) {
      this.#audioBuffer = await this.getAudioBuffer(audioContext);
    }

    return new AudioBufferSourceNode(audioContext, {
      buffer: this.#audioBuffer
    });
  }

  /**
   * Gets data as AudioBuffer
   * - Stores created AudioBuffer instance internally
   * - Transfers data from internal ArrayBuffer, which will be detached
   *
   * @param {AudioContext} audioContext
   *
   * @returns {Promise<AudioBuffer>}
   */
  async getAudioBuffer(audioContext) {
    if (!this._buffer) {
      throw new Error(ERROR_NOT_LOADED);
    }

    if (this._buffer.detached) {
      throw new Error(ERROR_TRANSFERRED);
    }

    this.#audioBuffer = await audioContext.decodeAudioData(this._buffer);

    return this.#audioBuffer;
  }
} // end class
