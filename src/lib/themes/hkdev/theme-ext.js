import theme from '../hkdev/theme.js';

import { theme as themeStore } from '$lib/stores/index.js';

/**
 * Set meta them color for the current theme
 */
export function setMetaThemeColor() {
  const props = theme.properties;

  themeStore.setMetaThemeColor(`rgb( ${props['--color-surface-950']})`);

  // setMetaThemeColorDark(`rgb( ${props['--color-primary-950']})`);
  // setMetaThemeColorBase(`rgb( ${props['--color-primary-50']})`);
}
