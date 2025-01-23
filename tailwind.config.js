import { default as TailwindTypography } from '@tailwindcss/typography';

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
  plugins: [TailwindTypography]
};
