import { default as TailwindTypography } from '@tailwindcss/typography';

import { skeleton } from '@skeletonlabs/skeleton/plugin';

import * as defaultThemes from '@skeletonlabs/skeleton/themes';

import * as customThemes from './src/lib/themes/index.js';

/**
 * Tailwind extensions for consistent scaling
 *
 * @note
 * Requires PostCSS import for CSS variables used in this config.
 *
 * In your src/app.postcss:
 * // @import "../src/lib/tailwind/extend/scaling/vars.postcss";
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
