// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

import { createWavResponse } from './mocks.js';

// > Mocks

import { AudioContext } from 'standardized-audio-context-mock';

beforeEach(() => {
	// @ts-ignore
	global.AudioContext = AudioContext;
	global.fetch = vi.fn();
});

afterEach(() => {
	// @ts-ignore
	delete global.fetch;

	// @ts-ignore
	delete global.AudioContext;
});

import AudioScene from './AudioScene.svelte.js';

describe('AudioScene', () => {
	it('should load an audio scene', async () => {
		// @ts-ignore
		fetch.mockResolvedValue(createWavResponse());

		const TINY_SILENCE = 'tiny-silence-1';

		/** @type {AudioScene} */
		let audioScene;

		const cleanup = $effect.root(() => {
			audioScene = new AudioScene();

			audioScene.defineMemorySource({
				label: TINY_SILENCE,
				url: 'http://localhost/not-a-real-url'
			});

			// expect(AudioScene.loaded).toEqual(false);

			const audioContext = new AudioContext();

			// @ts-ignore
			audioScene.load(audioContext);
		});

		await waitForState(() => {
			return audioScene.loaded;
		});

		// @ts-ignore
		expect(audioScene.loaded).toEqual(true);

		cleanup();
	});
});
