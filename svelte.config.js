import { sveltePreprocess } from 'svelte-preprocess';

import adapter from '@sveltejs/adapter-auto';
// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: sveltePreprocess({}),
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},
	// preprocess: vitePreprocess()

	// compilerOptions: {
	// 	runes: true
	// },
	// alias: {
	//   $lib: 'src/lib',

	//   $primitives: 'src/lib/primitives',
	//   ...
	// },
};

export default config;
