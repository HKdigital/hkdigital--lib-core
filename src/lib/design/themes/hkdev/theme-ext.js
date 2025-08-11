import { theme as themeStore } from '$lib/state/stores.js';

/**
 * Set meta them color for the current theme
 */
export function setMetaThemeColor() {
  const surfaceColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-surface-950')
    .trim();

  themeStore.setMetaThemeColor(`rgb(${surfaceColor})`);
}
