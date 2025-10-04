// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock ImageScene before importing ImageService
vi.mock('$lib/network/loaders.js', () => ({
  ImageScene: vi.fn(() => ({
    defineImage: vi.fn(),
    preload: vi.fn(),
    getObjectURL: vi.fn(),
    getImageMeta: vi.fn(),
    destroy: vi.fn()
  }))
}));

import ImageService from './ImageService.svelte.js';
import { ImageScene } from '$lib/network/loaders.js';

describe('ImageService', () => {
  let imageService;

  beforeEach(() => {
    vi.clearAllMocks();
    imageService = new ImageService('test-image-service');
  });

  describe('Scene Management', () => {
    it('should create a new scene', () => {
      const imageSources = [
        { label: 'image1', imageSource: { url: '/image1.jpg' } },
        { label: 'image2', imageSource: { url: '/image2.png' } }
      ];

      const scene = imageService.createScene('test-scene', imageSources);

      expect(ImageScene).toHaveBeenCalledOnce();
      expect(scene.defineImage).toHaveBeenCalledTimes(2);
      expect(scene.defineImage).toHaveBeenCalledWith(imageSources[0]);
      expect(scene.defineImage).toHaveBeenCalledWith(imageSources[1]);
      expect(imageService.scenes['test-scene']).toBe(scene);
    });

    it('should return existing scene if already created', () => {
      const imageSources = [{ label: 'image1', imageSource: { url: '/image1.jpg' } }];

      const scene1 = imageService.createScene('test-scene', imageSources);
      const scene2 = imageService.createScene('test-scene', imageSources);

      expect(scene1).toBe(scene2);
      expect(ImageScene).toHaveBeenCalledOnce();
    });

    it('should get an existing scene', () => {
      const imageSources = [{ label: 'image1', imageSource: { url: '/image1.jpg' } }];
      const createdScene = imageService.createScene('test-scene', imageSources);

      const retrievedScene = imageService.getScene('test-scene');

      expect(retrievedScene).toBe(createdScene);
    });

    it('should throw error when getting non-existent scene', () => {
      expect(() => {
        imageService.getScene('non-existent');
      }).toThrow('ImageScene [non-existent] not found');
    });

    it('should destroy a scene', () => {
      const imageSources = [{ label: 'image1', imageSource: { url: '/image1.jpg' } }];
      const scene = imageService.createScene('test-scene', imageSources);

      imageService.destroyScene('test-scene');

      expect(scene.destroy).toHaveBeenCalledOnce();
      expect(imageService.scenes['test-scene']).toBeUndefined();
    });

    it('should handle destroying non-existent scene', () => {
      imageService.destroyScene('non-existent');
      // Should not throw error
    });
  });

  describe('Image Operations', () => {
    let mockScene;

    beforeEach(() => {
      const imageSources = [{ label: 'test-image', imageSource: { url: '/test.jpg' } }];
      mockScene = imageService.createScene('test-scene', imageSources);
    });

    it('should get object URL from scene', () => {
      const mockObjectURL = 'blob:http://localhost/test-object-url';
      mockScene.getObjectURL.mockReturnValue(mockObjectURL);

      const result = imageService.getObjectURL('test-scene', 'test-image');

      expect(mockScene.getObjectURL).toHaveBeenCalledWith('test-image');
      expect(result).toBe(mockObjectURL);
    });

    it('should get image metadata from scene', () => {
      const mockImageMeta = {
        width: 800,
        height: 600,
        format: 'JPEG'
      };
      mockScene.getImageMeta.mockReturnValue(mockImageMeta);

      const result = imageService.getImageMeta('test-scene', 'test-image');

      expect(mockScene.getImageMeta).toHaveBeenCalledWith('test-image');
      expect(result).toBe(mockImageMeta);
    });

    it('should preload scene', () => {
      const options = { timeoutMs: 5000 };
      const mockResult = { promise: Promise.resolve(), abort: vi.fn() };
      mockScene.preload.mockReturnValue(mockResult);

      const result = imageService.preloadScene('test-scene', options);

      expect(mockScene.preload).toHaveBeenCalledWith(options);
      expect(result).toBe(mockResult);
    });
  });
});