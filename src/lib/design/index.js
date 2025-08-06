/**
 * @fileoverview HKdigital Core Design System
 * 
 * This module provides a comprehensive design system for building consistent,
 * responsive interfaces. It includes design tokens, generator functions,
 * and utility functions for creating custom Tailwind theme extensions.
 * 
 * @example Basic usage with default tokens
 * ```javascript
 * import { generateTailwindThemeExtensions, designTokens, customUtilitiesPlugin } from '@hkdigital/lib-core/design/index.js';
 *
 * const themeExtensions = generateTailwindThemeExtensions(designTokens);
 * 
 * export default {
 *   theme: {
 *     extend: themeExtensions
 *   },
 *   plugins: [customUtilitiesPlugin]
 * };
 * ```
 * 
 * @example Custom design tokens
 * ```javascript
 * import { generateTailwindThemeExtensions } from '@hkdigital/lib-core/design/index.js';
 *
 * const myTokens = {
 *   TEXT_POINT_SIZES: [4, 8, 12, 16, 24],
 *   TEXT_BASE_SIZES: {
 *     sm: { size: 12, lineHeight: 1.3 }
 *   }
 *   // ... other tokens
 * };
 * 
 * const themeExtensions = generateTailwindThemeExtensions(myTokens);
 * ```
 */

// === Design Tokens ===
// Default design tokens - projects can import and customize for their own design systems

export { designTokens } from './config/design-tokens.js';

// === Generator Functions ===
// Essential tools for projects to build custom Tailwind extensions

export {
  generateTailwindThemeExtensions,
  generateTextBasedSpacing,
  generateViewportBasedSpacing,
  generateTextStyles,
  generateBorderRadiusStyles,
  generateWidthStyles
} from './generators/index.js';

// === Plugins & Utilities ===
// Framework integration tools

export { customUtilitiesPlugin } from './plugins/skeleton.js';

// === Utilities ===
// Essential utility functions for design system implementation

export { 
  designTokensToRootCssVars,
  getRootCssDesignWidth,
  getRootCssDesignHeight,
  getAllRootScalingVars
} from './utils/root-vars.js';

export { 
  getClampParams,
  clamp
} from './utils/clamp.js';

export { toStateClasses } from './utils/states.js';

export {
  enableContainerScaling,
  enableScalingUI
} from './utils/scaling.js';
