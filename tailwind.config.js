import { default as TailwindTypography } from '@tailwindcss/typography';

import { skeleton } from '@skeletonlabs/skeleton/plugin';

import * as defaultThemes from '@skeletonlabs/skeleton/themes';

import * as customThemes from './src/lib/themes/index.js';

import {
  spacing,
  fontSize,
  borderRadius,
  borderWidth,
  strokeWidth
} from './src/lib/tailwind/extend/scaling/index.js';

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
      strokeWidth
    }
  },
  plugins: [
    TailwindTypography,
    skeleton({
      themes: [defaultThemes.cerberus, defaultThemes.rose, customThemes.hkdev]
    })
  ]
};
