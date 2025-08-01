/**
 * Design System Configuration
 * Using CSS Custom Properties (variables) for consistent scaling
 *
 * @note
 * The tailwind theme extensions require CSS custom
 * properties (variables) to be set at the root level
 * of your application to function properly.
 *
 * @example Implementation in SvelteKit +layout.svelte
 * <script>
 *   import { onMount } from 'svelte';
 *
 *   import '../app.css';
 *
 *   let { children } = $props();
 *
 *   import { DESIGN, CLAMPING }
 *     from '$lib/design/config/design-config.js';
 *
 *   import { rootDesignVarsHTML }
 *     from '@hkdigital/lib-core/design/utils/root-vars.js';
 * </script>
 *
 * <svelte:head>
 *   {@html rootDesignVarsHTML(DESIGN, CLAMPING)}
 * </svelte:head>
 *
 * Base units:
 * --scale-w: 0.052vw  (Viewport Width Point)
 * --scale-h: 0.09259vh (Viewport Height Point)
 * --scale-viewport: min(var(--scale-w), var(--scale-h)) (Viewport Point)
 * --scale-ui: clamp(0.3, var(--scale-viewport), 2) (UI Point)
 * --scale-text-base: clamp(0.75, var(--scale-viewport), 1.5) (Base Text)
 * --scale-text-heading: clamp(0.75, var(--scale-viewport), 2.25) (Heading Text)
 * --scale-text-ui: clamp(0.5, var(--scale-viewport), 1.25) (UI Text)
 *
 * --
 *
 * UI Points (up) - Clamped scaling values
 * Based on viewport scaling with minimum and maximum bounds
 * to ensure usability across all screen sizes
 *
 * > PREFERRED METHOD FOR UI ELEMENT SCALING
 *
 * Examples:
 * 5up  = 5px  at design size (clamps between 1.5px and 10px)
 * 10up = 10px at design size (clamps between 3px and 20px)
 * 20up = 20px at design size (clamps between 6px and 40px)
 *
 * Used for:
 * - Component padding and margins
 * - Interface element sizing
 * - Any UI element that needs responsive scaling with guardrails
 *
 * --
 *
 * Text-Based Spacing Units (ut, bt, ht)
 * Scaled by their respective text scaling variables
 *
 * > PREFERRED METHOD FOR TEXT-RELATED SPACING
 *
 * Examples:
 * 4ut = calc(4px * var(--scale-text-ui))       // UI text spacing
 * 4bt = calc(4px * var(--scale-text-base))  // Base text spacing
 * 4ht = calc(4px * var(--scale-text-heading))  // Heading text spacing
 *
 * Used for:
 * - ut: Button padding, form spacing, UI component margins
 * - bt: Paragraph margins, list spacing, base gaps
 * - ht: Heading margins, title spacing
 *
 * --
 *
 * Viewport Points (wp, hp) - Responsive scaling values
 * wp: Uses width-based scaling (1920px reference)
 * hp: Uses height-based scaling (1080px reference)
 *
 * > ALTERNATIVE SCALING METHODS
 *
 * Examples:
 * 10wp = calc(10px * var(--scale-w))
 * 10hp = calc(10px * var(--scale-h))
 *
 * Used for:
 * - Interface scaling that needs to fit both width and height
 * - Maintaining aspect ratio of design
 * - Preventing overflow in either direction
 */
import {
  generateTextBasedSpacing,
  generateViewportBasedSpacing,
  generateTextStyles,
  generateBorderRadiusStyles,
  generateWidthStyles
} from './generators/index.js';

import {
  TEXT_POINT_SIZES,
  VIEWPORT_POINT_SIZES,
  TEXT_BASE_SIZES,
  TEXT_HEADING_SIZES,
  TEXT_UI_SIZES,
  RADIUS_SIZES,
  BORDER_WIDTH_SIZES,
  STROKE_WIDTH_SIZES
} from './config/design-config.js';

/* == Internals */

const TEXT_BASED_SPACING = generateTextBasedSpacing(TEXT_POINT_SIZES);
const VIEWPORT_BASED_SPACING =
  generateViewportBasedSpacing(VIEWPORT_POINT_SIZES);

/* == Exports */

export const spacing = {
  ...VIEWPORT_BASED_SPACING,
  ...TEXT_BASED_SPACING
};

export const fontSize = {
  ...TEXT_BASED_SPACING,

  // Named styles
  ...generateTextStyles(TEXT_BASE_SIZES, 'base'),
  ...generateTextStyles(TEXT_HEADING_SIZES, 'heading'),
  ...generateTextStyles(TEXT_UI_SIZES, 'ui')
};

export const borderRadius = {
  // Named styles
  ...generateBorderRadiusStyles(RADIUS_SIZES)
};

export const borderWidth = {
  // Named styles
  ...generateWidthStyles(BORDER_WIDTH_SIZES, 'width')
};

export const strokeWidth = {
  // Named styles
  ...generateWidthStyles(STROKE_WIDTH_SIZES, 'width')
};

export const outlineWidth = {
  // Named styles
  ...generateWidthStyles(STROKE_WIDTH_SIZES, '')
};

export const outlineOffset = {
  // Named styles
  ...generateWidthStyles(STROKE_WIDTH_SIZES, '')
};

// console.log('borderWidth', borderWidth);
// console.log('outlineWidth', outlineWidth);
// console.log('outlineOffset', outlineOffset);
