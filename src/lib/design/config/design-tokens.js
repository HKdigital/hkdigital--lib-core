/**
 * @fileoverview HKdigital Design Tokens
 * 
 * Default design system tokens for the HKdigital design system.
 * These tokens define all the design values used to generate Tailwind theme extensions.
 * 
 * Users can create their own design-tokens.js file with custom values
 * and pass it to generateTailwindThemeExtensions().
 */

/* == Design dimensions == */

const DESIGN = {
  width: 1024,
  height: 768
};

/* == Scaling-clamping behaviour == */

const CLAMPING = {
  ui: { min: 0.3, max: 2 },
  textBase: { min: 0.75, max: 1.5 },
  textHeading: { min: 0.75, max: 2.25 },
  textUi: { min: 0.5, max: 1.25 }
};

/* == Text == */

const TEXT_POINT_SIZES = [
  1, 2, 4, 6, 8, 10, 11, 12, 16, 20, 24, 28, 32, 36, 50
];

const VIEWPORT_POINT_SIZES = [
  1, 2, 4, 5, 6, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180,
  200
];

const TEXT_BASE_SIZES = {
  sm: { size: 14, lineHeight: 1.25 },
  md: { size: 16, lineHeight: 1.25 },
  lg: { size: 18, lineHeight: 1.25 }
};

const TEXT_HEADING_SIZES = {
  h1: { size: 32, lineHeight: 1.25 },
  h2: { size: 28, lineHeight: 1.25 },
  h3: { size: 24, lineHeight: 1.25 },
  h4: { size: 20, lineHeight: 1.25 },
  h5: { size: 16, lineHeight: 1.25 }
};

const TEXT_UI_SIZES = {
  sm: { size: 14, lineHeight: 1 },
  md: { size: 16, lineHeight: 1 },
  lg: { size: 18, lineHeight: 1 }
};

/* == Border radius == */

const RADIUS_SIZES = {
  none: '0px',
  xs: { size: 5 },
  sm: { size: 10 },
  md: { size: 25 },
  lg: { size: 35 },
  full: '9999px'
};

/* == Border width == */

const BORDER_WIDTH_SIZES = {
  thin: { size: 1 },
  normal: { size: 2 },
  thick: { size: 4 }
};

/* == Stroke width == */

const STROKE_WIDTH_SIZES = {
  thin: { size: 1 },
  normal: { size: 2 },
  thick: { size: 4 }
};

/**
 * Complete design tokens configuration
 * 
 * @example Usage with generateTailwindThemeExtensions
 * ```javascript
 * import { generateTailwindThemeExtensions } from '@hkdigital/lib-core/design/index.js';
 * import { designTokens } from '@hkdigital/lib-core/design/config/design-tokens.js';
 * 
 * const themeExtensions = generateTailwindThemeExtensions(designTokens);
 * ```
 */
export const designTokens = {
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
};
