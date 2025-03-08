/**
 * Creates utility classes for UI font styling that work with Skeleton themes
 *
 * This plugin adds utility classes for UI typography that reference CSS
 * variables defined in your Skeleton theme, allowing consistent styling of UI
 * elements across your application.
 *
 * @note Important Configuration Requirements:
 * 1. Add UI font variables to your theme file:
 *    - `--ui-font-family`: Font family for UI elements
 *      (falls back to `--base-font-family`)
 *    - `--ui-font-color`: Text color for UI elements
 *      (falls back to `--base-font-color`)
 *    - `--ui-font-color-dark`: Dark mode text color
 *      (falls back to `--base-font-color-dark`)
 *
 * 2. This plugin generates the following utility classes:
 *    - `font-ui`: Applies UI font family
 *    - `text-ui`: Applies UI text color
 *    - `text-ui-dark`: Applies UI dark mode text color (with .dark selector)
 *
 * @example
 * // tailwind.config.js
 * import { customUtilitiesPlugin }
 *   from './src/lib/util/design-system/skeleton.js';
 *
 * export default {
 *   plugins: [
 *     customUtilitiesPlugin,
 *     skeleton({
 *       themes: [defaultThemes.cerberus, customThemes.yourTheme]
 *     })
 *   ]
 * };
 *
 * @param {Object} api - Tailwind plugin API
 * @param {Function} api.addUtilities - Function to add utilities
 */
export function customUtilitiesPlugin({ addUtilities }) {
  const utilities = {
    '.font-ui': {
      'font-family': 'var(--ui-font-family, var(--base-font-family))'
    },
    '.text-base-color': {
      color: 'var(--base-font-color)'
    },
    '.text-base-color-dark': {
      color: 'var(--base-font-color-dark)'
    },
    '.text-heading-color': {
      color: 'var(--heading-font-color)'
    },
    '.text-heading-color-dark': {
      color: 'var(--heading-font-color-dark)'
    },
    '.text-ui-color': {
      color: 'var(--ui-font-color, var(--base-font-color))'
    },
    '.text-ui-color-dark': {
      color: 'var(--ui-font-color-dark, var(--base-font-color-dark))'
    }
  };

  addUtilities(utilities);
}
