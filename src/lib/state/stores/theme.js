/**
 * @example Set theme color in a layout file
 *
 * // +layout.svelte
 * <script>
 * import { theme as themeStore } from './theme.js';
 *
 * const { metaThemeColorBase, metaThemeColorDark } = themeStore;
 * </script>
 *
 * <svelte:head>
 *   <meta
 *     name="theme-color"
 *     media="(prefers-color-scheme: light)"
 *     content={$metaThemeColorBase}
 *   />
 *   <meta
 *     name="theme-color"
 *     media="(prefers-color-scheme: dark)"
 *     content={$metaThemeColorDark}
 *   />
 * </svelte:head>
 */

import { writable, get } from 'svelte/store';

// > Internals

const DEFAULT_THEME_COLOR_BASE = '#fffffe';
const DEFAULT_THEME_COLOR_DARK = '#000001';

/** @type {import('svelte/store').Writable<string>} */
const themeColorBase = writable(DEFAULT_THEME_COLOR_BASE);

/** @type {import('svelte/store').Writable<string|null>} */
const themeColorDark = writable(DEFAULT_THEME_COLOR_DARK);

// > Exports

/**
 * Set meta theme color for both light and dark mode
 *
 * @param {string} value - HTML Color
 */
export function setMetaThemeColor(value) {
	themeColorBase.set(value);
	themeColorDark.set(value);
}

/**
 * Set meta theme color for light mode
 *
 * @param {string} value - HTML Color
 */
export function setMetaThemeColorBase(value) {
	themeColorBase.set(value);
}

/**
 * Set meta theme color for dark mode only
 *
 * @param {string} value - HTML Color
 */
export function setMetaThemeColorDark(value) {
	themeColorDark.set(value);
}

export const metaThemeColorBase = {
	subscribe: themeColorBase.subscribe,
	get: () => {
		get(themeColorBase);
	}
};

export const metaThemeColorDark = {
	subscribe: themeColorDark.subscribe,
	get: () => {
		get(themeColorDark);
	}
};
