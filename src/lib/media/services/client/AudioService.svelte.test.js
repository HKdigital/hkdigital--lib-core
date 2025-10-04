// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AudioScene before importing AudioService
vi.mock('$lib/network/loaders.js', () => ({
  AudioScene: vi.fn(() => ({
    defineMemorySource: vi.fn(),
    preload: vi.fn(),
    mute: vi.fn(),
    unmute: vi.fn(),
    getSourceNode: vi.fn(),
    destroy: vi.fn()
  }))
}));

import AudioService from './AudioService.svelte.js';
import { AudioScene } from '$lib/network/loaders.js';

describe('AudioService', () => {
  let audioService;

  beforeEach(() => {
    vi.clearAllMocks();
    audioService = new AudioService('test-audio-service');
  });

  describe('Scene Management', () => {
    it('should create a new scene', () => {
      const memorySources = [
        { label: 'sound1', url: '/sound1.wav' },
        { label: 'sound2', url: '/sound2.wav' }
      ];

      const scene = audioService.createScene('test-scene', memorySources);

      expect(AudioScene).toHaveBeenCalledOnce();
      expect(scene.defineMemorySource).toHaveBeenCalledTimes(2);
      expect(scene.defineMemorySource).toHaveBeenCalledWith(memorySources[0]);
      expect(scene.defineMemorySource).toHaveBeenCalledWith(memorySources[1]);
      expect(audioService.scenes['test-scene']).toBe(scene);
    });

    it('should return existing scene if already created', () => {
      const memorySources = [{ label: 'sound1', url: '/sound1.wav' }];

      const scene1 = audioService.createScene('test-scene', memorySources);
      const scene2 = audioService.createScene('test-scene', memorySources);

      expect(scene1).toBe(scene2);
      expect(AudioScene).toHaveBeenCalledOnce();
    });

    it('should get an existing scene', () => {
      const memorySources = [{ label: 'sound1', url: '/sound1.wav' }];
      const createdScene = audioService.createScene('test-scene', memorySources);

      const retrievedScene = audioService.getScene('test-scene');

      expect(retrievedScene).toBe(createdScene);
    });

    it('should throw error when getting non-existent scene', () => {
      expect(() => {
        audioService.getScene('non-existent');
      }).toThrow('AudioScene [non-existent] not found');
    });

    it('should destroy a scene', () => {
      const memorySources = [{ label: 'sound1', url: '/sound1.wav' }];
      const scene = audioService.createScene('test-scene', memorySources);

      audioService.destroyScene('test-scene');

      expect(scene.destroy).toHaveBeenCalledOnce();
      expect(audioService.scenes['test-scene']).toBeUndefined();
    });

    it('should handle destroying non-existent scene', () => {
      audioService.destroyScene('non-existent');
      // Should not throw error
    });
  });

  describe('Audio Operations', () => {
    let mockScene;
    let mockSourceNode;

    beforeEach(() => {
      const memorySources = [{ label: 'test-sound', url: '/test.wav' }];
      mockScene = audioService.createScene('test-scene', memorySources);

      mockSourceNode = {
        loop: false,
        start: vi.fn(),
        stop: vi.fn()
      };
      mockScene.getSourceNode.mockResolvedValue(mockSourceNode);
    });

    it('should play sound with default options', async () => {
      const result = await audioService.playSound('test-scene', 'test-sound');

      expect(mockScene.getSourceNode).toHaveBeenCalledWith('test-sound');
      expect(result).toHaveProperty('stop');
      expect(result).toHaveProperty('sourceNode');
      expect(result.sourceNode).toBe(mockSourceNode);
    });

    it('should play sound with loop option', async () => {
      const result = await audioService.playSound(
        'test-scene',
        'test-sound',
        { loop: true }
      );

      expect(result.sourceNode.loop).toBe(true);
    });

    it('should play sound with delay', async () => {
      vi.useFakeTimers();

      const playPromise = audioService.playSound(
        'test-scene',
        'test-sound',
        { delay: 1000 }
      );

      // Source should not start immediately
      const result = await playPromise;
      expect(result.sourceNode.start).not.toHaveBeenCalled();

      // Should start after delay
      vi.advanceTimersByTime(1000);
      expect(result.sourceNode.start).toHaveBeenCalledOnce();

      vi.useRealTimers();
    });

    it('should stop sound before it starts', async () => {
      vi.useFakeTimers();

      const result = await audioService.playSound(
        'test-scene',
        'test-sound',
        { delay: 1000 }
      );

      result.stop();
      vi.advanceTimersByTime(1000);

      expect(result.sourceNode.start).not.toHaveBeenCalled();
      expect(result.sourceNode.stop).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should mute all scenes', () => {
      const memorySources = [{ label: 'sound', url: '/sound.wav' }];
      const scene1 = audioService.createScene('scene1', memorySources);
      const scene2 = audioService.createScene('scene2', memorySources);

      audioService.mute();

      expect(scene1.mute).toHaveBeenCalledOnce();
      expect(scene2.mute).toHaveBeenCalledOnce();
      expect(audioService.muted).toBe(true);
    });

    it('should unmute all scenes', () => {
      const memorySources = [{ label: 'sound', url: '/sound.wav' }];
      const scene1 = audioService.createScene('scene1', memorySources);
      const scene2 = audioService.createScene('scene2', memorySources);

      audioService.unmute();

      expect(scene1.unmute).toHaveBeenCalledOnce();
      expect(scene2.unmute).toHaveBeenCalledOnce();
      expect(audioService.muted).toBe(false);
    });

    it('should preload scene', () => {
      const options = { timeoutMs: 5000 };
      const mockResult = { promise: Promise.resolve(), abort: vi.fn() };
      mockScene.preload.mockReturnValue(mockResult);

      const result = audioService.preloadScene('test-scene', options);

      expect(mockScene.preload).toHaveBeenCalledWith(options);
      expect(result).toBe(mockResult);
    });
  });
});