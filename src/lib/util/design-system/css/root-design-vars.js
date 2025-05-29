import { getRootCssVar } from '$lib/util/css/css-vars.js';

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
 * @param {Object} clamping.textBase - Base text scaling configuration
 * @param {number} clamping.textBase.min - Minimum base text scaling
 * @param {number} clamping.textBase.max - Maximum base text scaling
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
 * import { rootDesignVarsHTML } from '$lib/util/design-system/index.js';
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

      /* Scaling factors */
      --scale-w: 1;
      --scale-h: 1;

      /* --scale-viewport: min(var(--scale-w), var(--scale-h)); */
      --scale-viewport: 1;

      /* Base clamping units */
      --scale-ui: clamp(${clamping.ui.min}, var(--scale-viewport), ${clamping.ui.max});
      --scale-text-base: clamp(${clamping.textBase.min}, var(--scale-viewport), ${clamping.textBase.max});
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
 * Retrieves all current scaling factors from CSS variables
 *
 * @returns {Object} An object containing all scaling factors
 */
export function getAllRootScalingVars() {
  const styles = getComputedStyle(document.documentElement);

  return {
    scaleW: parseFloat(styles.getPropertyValue('--scale-w').trim()) || 0,
    scaleH: parseFloat(styles.getPropertyValue('--scale-h').trim()) || 0,
    scaleViewport:
      parseFloat(styles.getPropertyValue('--scale-viewport').trim()) || 0,

    scaleUI: parseFloat(styles.getPropertyValue('--scale-ui').trim()) || 0,
    scaleTextBase:
      parseFloat(styles.getPropertyValue('--scale-text-base').trim()) || 0,
    scaleTextHeading:
      parseFloat(styles.getPropertyValue('--scale-text-heading').trim()) || 0,
    scaleTextUI:
      parseFloat(styles.getPropertyValue('--scale-text-ui').trim()) || 0
  };
}
