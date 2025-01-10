// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { waitForState } from '$lib/util/svelte/wait/index.js';

import { createWavResponse } from './mocks.js';

// > Mocks

beforeEach(() => {
	global.fetch = vi.fn();
});

afterEach(() => {
	// @ts-ignore
	delete global.fetch;
});

import AudioLoader from './AudioLoader.svelte.js';

describe('AudioLoader', () => {
	it('should load an audio file via a chunked stream', async () => {
		// @ts-ignore
		fetch.mockResolvedValue(createWavResponse());

		const url = 'http://localhost/mock-wav';

		/** @type {AudioLoader} */
		let audioLoader;

		const cleanup = $effect.root(() => {
			audioLoader = new AudioLoader({ url });

			expect(audioLoader.loaded).toEqual(false);

			audioLoader.load();
		});

		await waitForState(() => {
			return audioLoader.loaded;
		});

		// @ts-ignore
		expect(audioLoader.loaded).toEqual(true);

		// @ts-ignore
		expect(audioLoader.progress).toEqual({
			bytesLoaded: 132,
			size: 132,
			loaded: true
		});

		cleanup();
	});
});
