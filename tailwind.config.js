/**
 * The following tailwind theme extensions require CSS custom
 * properties (variables) to be set at the root level
 * of your application to function properly.
 *
 * @example Implementation in SvelteKit +layout.svelte
 * <script>
 *   import { onMount } from 'svelte';
 *
 *   import '../app.css';
 *
 *   let { children } = $props();
 *
 *   import { designTokens, designTokensToRootCssVars } from '@hkdigital/lib-core/design/index.js';
 * </script>
 *
 * <svelte:head>
 *   {@html designTokensToRootCssVars(designTokens)}
 * </svelte:head>
 *
 * {@render children()}
 *
 */
import {
  generateTailwindThemeExtensions,
  designTokens,
  customUtilitiesPlugin
} from './src/lib/design/index.js';

const themeExtensions = generateTailwindThemeExtensions(designTokens);

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'selector',
  theme: {
    extend: themeExtensions
  },
  plugins: [customUtilitiesPlugin]
};

// console.log('tailwind > theme > extend', JSON.stringify(themeExtensions, null, 2));
