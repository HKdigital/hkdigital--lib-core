import { ServiceBase } from '$lib/services/index.js';

import { AudioScene } from '$lib/network/loaders.js';

/** @typedef {import('$lib/network/loaders/typedef.js').SceneLoadingProgress} SceneLoadingProgress */

export default class AudioService extends ServiceBase {
  /** @type {Record<string, AudioScene>} */
  scenes = {};

  muted = $state(false);

  /**
   * Configure the service (handles both initial config and reconfiguration)
   *
   * @param {any} newConfig - Configuration to apply
   * @param {any} [oldConfig=null] - Previous config (null = initial setup)
   */
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig) {
    // console.debug('Configure AudioService');
  }

  mute() {
    //this.logger.debug('mute all');

    for (const label in this.scenes) {
      const scene = this.scenes[label];
      scene.mute();
    }

    this.muted = true;
  }

  unmute() {
    // this.logger.debug('unmute all');

    for (const label in this.scenes) {
      const scene = this.scenes[label];
      scene.unmute();
    }

    this.muted = false;
  }

  /**
   * Play a sound from the specified audio scene
   *
   * @param {string} sceneLabel
   * @param {string} soundLabel
   * @param {{delay?:number, loop?:boolean}} options
   *
   * @returns {Promise<{stop: ()=>void, sourceNode:AudioBufferSourceNode}>}
   */
  async playSound(sceneLabel, soundLabel, options = {}) {
    const audioScene = await this.getScene(sceneLabel);

    const sourceNode = await audioScene.getSourceNode(soundLabel);

    const { delay = 0, loop = false } = options;

    sourceNode.loop = loop;

    let started = false;

    /** @type {ReturnType<typeof setTimeout>|null} */
    let timer = setTimeout(() => {
      // console.debug('playSound', soundLabel);
      sourceNode.start();
      started = true;
    }, delay);

    return {
      stop: () => {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }

        if (started) {
          sourceNode.stop();
          started = false;
        }
      },
      sourceNode
    };
  }

  /**
   * Get an audio scene
   *
   * @param {string} sceneLabel
   * @param {import('$lib/network/loaders/typedef.js').MemorySourceParams[]} memorySources
   *
   * @returns {AudioScene}
   */
  createScene(sceneLabel, memorySources) {
    let audioScene = this.scenes[sceneLabel];

    if (audioScene) {
      // Scene already created
      // => Do nothing
      return audioScene;
    }

    audioScene = new AudioScene();

    for (const memorySource of memorySources) {
      audioScene.defineMemorySource(memorySource);
    }

    this.scenes[sceneLabel] = audioScene;

    return audioScene;
  }

  /**
   * Get an audio scene
   *
   * @param {string} label
   */
  destroyScene(label) {
    const scene = this.scenes[label];

    if (scene) {
      scene.destroy();
      delete this.scenes[label];
    }
  }

  /**
   * Get an audio scene
   *
   * @param {string} label
   *
   * @param {object} [options]
   * @param {number} [options.timeoutMs=10000]
   *   Timeout in milliseconds
   * @param {(progress: SceneLoadingProgress) => void} [options.onProgress]
   *   Progress callback function
   *
   * @returns {{promise: Promise<AudioScene>, abort: Function}}
   *   Object with promise that resolves when loaded and abort function
   */
  preloadScene(label, options) {
    const audioScene = this.getScene(label);

    // @ts-ignore (AudioScene extends SceneBase)
    return audioScene.preload(options);
  }

  /**
   * Get an audio scene
   *
   * @param {string} label
   *
   * @returns {AudioScene}
   */
  getScene(label) {
    const audioScene = this.scenes[label];

    if (!audioScene) {
      throw new Error(`AudioScene [${label}] not found`);
    }

    return audioScene;
  }
}
