import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import { imagetools } from 'vite-imagetools';

import {
	generateDefaultDirectives,
	generateResponseConfigs
} from './src/lib/config/imagetools-config.js';

// import {
//   generateDefaultDirectives,
//   generateResponseConfigs
// } from './imagetools-config.js__';

export default defineConfig({
	plugins: [
		// @ts-ignore
		sveltekit(),
		// @ts-ignore
		imagetools({
			defaultDirectives: generateDefaultDirectives(),
			resolveConfigs: generateResponseConfigs()
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'src/**/*.svelte.{test,spec}.{js,ts}']
	}
});
