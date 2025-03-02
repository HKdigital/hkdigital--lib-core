import { getRootCssVar } from './css-vars.js';

/**
 * Generates a complete HTML style tag with CSS custom properties for
 * the design system based on provided configuration.
 *
 * @param {Object} design - Design dimensions configuration
 * @param {number} design.width - The design width in pixels
 * @param {number} design.height - The design height in pixels
 * @param {Object} clamping - Scaling configuration parameters
 * @param {Object} clamping.ui - UI clamping configuration
 * @param {number} clamping.ui.min - Minimum UI scaling factor
 * @param {number} clamping.ui.max - Maximum UI scaling factor
 * @param {Object} clamping.textContent - Content text scaling configuration
 * @param {number} clamping.textContent.min - Minimum content text scaling
 * @param {number} clamping.textContent.max - Maximum content text scaling
 * @param {Object} clamping.textHeading - Heading text clamping configuration
 * @param {number} clamping.textHeading.min - Minimum heading text scaling
 * @param {number} clamping.textHeading.max - Maximum heading text scaling
 * @param {Object} clamping.textUi - UI text clamping configuration
 * @param {number} clamping.textUi.min - Minimum UI text scaling
 * @param {number} clamping.textUi.max - Maximum UI text scaling
 *
 * @returns {string} Complete HTML style tag with design system CSS variables
 *
 * @example
 * // +layout.svelte
 * <script>
 * import { DESIGN, CLAMPING } from '$lib/tailwind/extend/clamping/config.js';
 *
 * import { rootDesignVarsHTML } from '$lib/util/css/design-system.js';
 * </script>
 *
 * <svelte:head>
 * {@html rootDesignVarsHTML(DESIGN, CLAMPING)}
 * </svelte:head>
 *
 * // Generates style tag for use in svelte:head
 * // <style>:root { --design-width: 1920; ... }</style>
 */
export function rootDesignVarsHTML(design, clamping) {
  return `<style>:root {
      /* Design dimensions */
      --design-width: ${design.width};
      --design-height: ${design.height};

      /* Base clamping units */
      --scale-w: 1;
      --scale-h: 1;
      --scale-viewport: min(var(--scale-w), var(--scale-h));

      /* Scaling factors with configurable clamping */
      --scale-ui: clamp(${clamping.ui.min}, var(--scale-viewport), ${clamping.ui.max});
      --scale-text-content: clamp(${clamping.textContent.min}, var(--scale-viewport), ${clamping.textContent.max});
      --scale-text-heading: clamp(${clamping.textHeading.min}, var(--scale-viewport), ${clamping.textHeading.max});
      --scale-text-ui: clamp(${clamping.textUi.min}, var(--scale-viewport), ${clamping.textUi.max});
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
