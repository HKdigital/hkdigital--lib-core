import { default as TailwindTypography } from '@tailwindcss/typography';

import { skeleton } from '@skeletonlabs/skeleton/plugin';

import * as defaultThemes from '@skeletonlabs/skeleton/themes';

import * as customThemes from './src/lib/themes/index.js';

import {
  spacing,
  fontSize,
  borderRadius,
  borderWidth
} from './src/lib/config/tailwind.extend.js';

/** @type {import('tailwindcss').Config} \*/
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'selector',
  theme: {
    extend: {
      spacing,
      fontSize,
      borderRadius,
      borderWidth
    }
  },
  plugins: [
    TailwindTypography,
    skeleton({
      themes: [defaultThemes.cerberus, defaultThemes.rose, customThemes.hkdev]
    })
  ]
};
