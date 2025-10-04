import { ServiceBase } from '$lib/services/index.js';

import { ImageScene } from '$lib/network/loaders.js';

/** @typedef {import('$lib/network/loaders/typedef.js').SceneLoadingProgress} SceneLoadingProgress */

export default class ImageService extends ServiceBase {
  /** @type {Record<string, ImageScene>} */
  scenes = {};

  /**
   * Configure the service (handles both initial config and reconfiguration)
   *
   * @param {any} newConfig - Configuration to apply
   * @param {any} [oldConfig=null] - Previous config (null = initial setup)
   */
  // eslint-disable-next-line no-unused-vars
  async _configure(newConfig, oldConfig) {
    // console.debug('Configure ImageService');
  }

  /**
   * Get an image from the specified image scene
   *
   * @param {string} sceneLabel
   * @param {string} imageLabel
   *
   * @returns {string} Object URL for the image
   */
  getObjectURL(sceneLabel, imageLabel) {
    const imageScene = this.getScene(sceneLabel);
    return imageScene.getObjectURL(imageLabel);
  }

  /**
   * Get image metadata from the specified image scene
   *
   * @param {string} sceneLabel
   * @param {string} imageLabel
   *
   * @returns {import('$lib/network/loaders/image/typedef.js').ImageMeta}
   */
  getImageMeta(sceneLabel, imageLabel) {
    const imageScene = this.getScene(sceneLabel);
    return imageScene.getImageMeta(imageLabel);
  }

  /**
   * Create an image scene
   *
   * @param {string} sceneLabel
   * @param {Array<{label: string, imageSource: import('$lib/config/typedef.js').ImageSource}>} imageSources
   *
   * @returns {ImageScene}
   */
  createScene(sceneLabel, imageSources) {
    let imageScene = this.scenes[sceneLabel];

    if (imageScene) {
      // Scene already created
      // => Do nothing
      return imageScene;
    }

    imageScene = new ImageScene();

    for (const imageSource of imageSources) {
      imageScene.defineImage(imageSource);
    }

    this.scenes[sceneLabel] = imageScene;

    return imageScene;
  }

  /**
   * Destroy an image scene
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
   * Get an image scene
   *
   * @param {string} label
   *
   * @param {object} [options]
   * @param {number} [options.timeoutMs=10000]
   *   Timeout in milliseconds
   * @param {(progress: SceneLoadingProgress) => void} [options.onProgress]
   *   Progress callback function
   *
   * @returns {{promise: Promise<ImageScene>, abort: Function}}
   *   Object with promise that resolves when loaded and abort function
   */
  preloadScene(label, options) {
    const imageScene = this.getScene(label);

    // @ts-ignore (ImageScene extends SceneBase)
    return imageScene.preload(options);
  }

  /**
   * Get an image scene
   *
   * @param {string} label
   *
   * @returns {ImageScene}
   */
  getScene(label) {
    const imageScene = this.scenes[label];

    if (!imageScene) {
      throw new Error(`ImageScene [${label}] not found`);
    }

    return imageScene;
  }
}