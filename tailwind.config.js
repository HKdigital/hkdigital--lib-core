import { default as TailwindTypography } from '@tailwindcss/typography';

import { skeleton } from '@skeletonlabs/skeleton/plugin';

import * as defaultThemes from '@skeletonlabs/skeleton/themes';

import * as customThemes from './src/lib/themes/index.js';

/**
 * The following tailwind theme extensions require CSS custom
 * properties (variables) to be set at the root level
 * of your application to function properly.
 *
 * @example Implementation in SvelteKit +layout.svelte
 * <script>
 *   import { onMount } from 'svelte';
 *
 *   import '../app.postcss';
 *
 *   let { children } = $props();
 *
 *   import { DESIGN, CLAMPING } from '$lib/design/design-config.js';
 *
 *   import { rootDesignVarsHTML } from '@hkdigital/lib-sveltekit/util/design-system/index.js';
 * </script>
 *
 * <svelte:head>
 *   {@html rootDesignVarsHTML(DESIGN, CLAMPING)}
 * </svelte:head>
 *
 * {@render children()}
 *
 */
import {
  spacing,
  fontSize,
  borderRadius,
  borderWidth,
  strokeWidth,
  outlineWidth,
  outlineOffset
} from './src/lib/design/tailwind-theme-extend.js';

/** @type {import('tailwindcss').Config} \*/
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'selector',
  theme: {
    extend: {
      spacing,
      fontSize,
      borderRadius,
      borderWidth,
      strokeWidth,
      outlineWidth,
      outlineOffset
    }
  },
  plugins: [
    TailwindTypography,
    skeleton({
      themes: [defaultThemes.cerberus, defaultThemes.rose, customThemes.hkdev]
    })
  ]
};

// console.log("tailwind > theme > extend", {
//   spacing,
//   fontSize,
//   borderRadius,
//   borderWidth,
//   strokeWidth,
//   outlineWidth,
//   outlineOffset
// });
