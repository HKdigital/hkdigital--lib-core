/**
 * @fileoverview HKdigital Core Design System
 * 
 * This module provides a comprehensive design system for building consistent,
 * responsive interfaces. It includes configuration objects, generator functions,
 * and ready-to-use Tailwind theme extensions.
 * 
 * @example Basic usage in tailwind.config.js
 * ```javascript
 * import { spacing, fontSize, customUtilitiesPlugin } from '@hkdigital/lib-core/design';
 * 
 * export default {
 *   theme: {
 *     extend: { spacing, fontSize }
 *   },
 *   plugins: [customUtilitiesPlugin]
 * };
 * ```
 * 
 * @example Advanced customization
 * ```javascript
 * import { 
 *   generateTextBasedSpacing, 
 *   DESIGN, 
 *   TEXT_POINT_SIZES 
 * } from '@hkdigital/lib-core/design';
 * 
 * const customSpacing = generateTextBasedSpacing([8, 12, 16, 24]);
 * ```
 */

// === Configuration Objects ===
// Projects can import and customize these for their own design systems

export {
  DESIGN,
  CLAMPING,
  TEXT_POINT_SIZES,
  VIEWPORT_POINT_SIZES,
  TEXT_BASE_SIZES,
  TEXT_HEADING_SIZES,
  TEXT_UI_SIZES,
  RADIUS_SIZES,
  BORDER_WIDTH_SIZES,
  STROKE_WIDTH_SIZES
} from './config/design-config.js';

// === Generator Functions ===
// Essential tools for projects to build custom Tailwind extensions

export {
  generateTextBasedSpacing,
  generateViewportBasedSpacing,
  generateTextStyles,
  generateBorderRadiusStyles,
  generateWidthStyles
} from './generators/index.js';

// === Ready-to-use Tailwind Extensions ===
// Built using default configuration - projects can use directly or as reference

export {
  spacing,
  fontSize,
  borderRadius,
  borderWidth,
  strokeWidth,
  outlineWidth,
  outlineOffset
} from './tailwind-theme-extend.js';

// === Plugins & Utilities ===
// Framework integration tools

export { customUtilitiesPlugin } from './plugins/skeleton.js';
export { rootDesignVarsHTML } from './utils/root-vars.js';

// === Themes ===
// Complete styling systems (public - other projects can use or extend)

export * from './themes/index.js';