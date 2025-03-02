import { getRootCssVar } from './css-vars.js';

/**
 * Generates a complete HTML style tag with CSS custom properties for
 * the design system based on provided configuration.
 *
 * @param {Object} design - Design dimensions configuration
 * @param {number} design.width - The design width in pixels
 * @param {number} design.height - The design height in pixels
 * @param {Object} scaling - Scaling configuration parameters
 * @param {Object} scaling.ui - UI scaling configuration
 * @param {number} scaling.ui.min - Minimum UI scaling factor
 * @param {number} scaling.ui.max - Maximum UI scaling factor
 * @param {Object} scaling.textContent - Content text scaling configuration
 * @param {number} scaling.textContent.min - Minimum content text scaling
 * @param {number} scaling.textContent.max - Maximum content text scaling
 * @param {Object} scaling.textHeading - Heading text scaling configuration
 * @param {number} scaling.textHeading.min - Minimum heading text scaling
 * @param {number} scaling.textHeading.max - Maximum heading text scaling
 * @param {Object} scaling.textUi - UI text scaling configuration
 * @param {number} scaling.textUi.min - Minimum UI text scaling
 * @param {number} scaling.textUi.max - Maximum UI text scaling
 * @returns {string} Complete HTML style tag with design system CSS variables
 *
 * @example
 * // +layout.svelte
 * <script>
 * import { DESIGN, SCALING } from '$lib/tailwind/extend/scaling/config.js';
 *
 * import { rootDesignVarsHTML } from '$lib/util/css/design-system.js';
 * </script>
 *
 * <svelte:head>
 * {@html rootDesignVarsHTML(DESIGN, SCALING)}
 * </svelte:head>
 *
 * // Generates style tag for use in svelte:head
 * // <style>:root { --design-width: 1920; ... }</style>
 */
export function rootDesignVarsHTML(design, scaling) {
  return `<style>:root {
      /* Design dimensions */
      --design-width: ${design.width};
      --design-height: ${design.height};

      /* Base scaling units */
      --scale-w: 1;
      --scale-h: 1;
      --scale-viewport: min(var(--scale-w), var(--scale-h));

      /* Scaling factors with configurable clamping */
      --scale-ui: clamp(${scaling.ui.min}, var(--scale-viewport), ${scaling.ui.max});
      --scale-text-content: clamp(${scaling.textContent.min}, var(--scale-viewport), ${scaling.textContent.max});
      --scale-text-heading: clamp(${scaling.textHeading.min}, var(--scale-viewport), ${scaling.textHeading.max});
      --scale-text-ui: clamp(${scaling.textUi.min}, var(--scale-viewport), ${scaling.textUi.max});
    }</style>`;
}

/**
 * Get design width from CSS variables
 *
 * @returns {number} Design width
 */
export function getRootCssDesignWidth() {
  return getRootCssVar('design-width');
}

/**
 * Get design height from CSS variables
 *
 * @returns {number} Design height
 */
export function getRootCssDesignHeight() {
  return getRootCssVar('design-height');
}

/**
 * Generates state classes from an object of state variables
 *
 * @param {Object.<string, boolean>} stateObject
 *   Object with state names as keys and boolean values
 *
 * @returns {string} Space-separated string of state classes
 *
 * @example
 * // Returns "state-selected state-error"
 * toStateClasses({ selected: true, loading: false, error: true });
 */
export function toStateClasses(stateObject) {
  if (!stateObject || typeof stateObject !== 'object') {
    return '';
  }

  return Object.entries(stateObject)
    .filter((entry) => entry[1] === true)
    .map(([state]) => `state-${state}`)
    .join(' ');
}
