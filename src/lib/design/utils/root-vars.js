/**
 * CSS Variables Utilities
 * Copied from $lib/util/css/css-vars.js to make design system self-contained
 */

let cssVarCache = {};

/**
 * Normalizes a CSS variable name to ensure it has the -- prefix
 *
 * @param {string} varName - The CSS variable name
 * @returns {string} Normalized variable name with -- prefix
 */
function normalizeCssVarName(varName) {
  if (typeof varName !== 'string') {
    throw new Error('Variable name must be a string');
  }
  return varName.startsWith('--') ? varName : `--${varName}`;
}

/**
 * Extract a CSS variable value from document root
 *
 * @param {string} varName - CSS variable name without '--'
 * @param {boolean} [useCache=false]
 *
 * @returns {any} Parsed value or default
 */
function getRootCssVar(varName, useCache = false) {
  if (cssVarCache[varName] !== undefined && useCache) {
    return cssVarCache[varName];
  }

  // Get computed style from document root
  const rootStyle = getComputedStyle(document.documentElement);
  const declaration = rootStyle.getPropertyValue(`--${varName}`).trim();

  if (!declaration) {
    return null;
  }

  let result;

  // Try to parse as number
  if (!isNaN(parseFloat(declaration))) {
    result = parseFloat(declaration);
  } else {
    // Return string value
    result = declaration;
  }

  // Cache the result
  cssVarCache[varName] = result;
  return result;
}

/**
 * Sets a CSS variable in :root to a new value
 *
 * @param {string} varName - The CSS variable name (with or without --)
 * @param {string|number} value - The new value to set
 * @returns {boolean} True if successful, false otherwise
 */
function setRootCssVar(varName, value) {
  try {
    if (varName === undefined || varName === null) {
      throw new Error('Variable name cannot be null or undefined');
    }

    if (value === undefined || value === null) {
      throw new Error('Value cannot be null or undefined');
    }

    const normalizedName = normalizeCssVarName(varName);

    // Convert to string if numeric
    const formattedValue = typeof value === 'number' ? `${value}` : value;

    document.documentElement.style.setProperty(normalizedName, formattedValue);

    delete cssVarCache[varName];

    return true;
  } catch (error) {
    console.error(`Error setting CSS variable ${varName}:`, error);
    return false;
  }
}

/**
 * Generates a complete HTML style tag with CSS custom properties for
 * the design system based on provided design tokens configuration.
 *
 * @param {Object} designTokens - Complete design tokens object
 * @param {Object} designTokens.DESIGN - Design dimensions configuration
 * @param {number} designTokens.DESIGN.width - The design width in pixels
 * @param {number} designTokens.DESIGN.height - The design height in pixels
 * @param {Object} designTokens.CLAMPING - Scaling configuration parameters
 * @param {Object} designTokens.CLAMPING.ui - UI clamping configuration
 * @param {number} designTokens.CLAMPING.ui.min - Minimum UI scaling factor
 * @param {number} designTokens.CLAMPING.ui.max - Maximum UI scaling factor
 * @param {Object} designTokens.CLAMPING.textBase - Base text scaling configuration
 * @param {number} designTokens.CLAMPING.textBase.min - Minimum base text scaling
 * @param {number} designTokens.CLAMPING.textBase.max - Maximum base text scaling
 * @param {Object} designTokens.CLAMPING.textHeading - Heading text clamping configuration
 * @param {number} designTokens.CLAMPING.textHeading.min - Minimum heading text scaling
 * @param {number} designTokens.CLAMPING.textHeading.max - Maximum heading text scaling
 * @param {Object} designTokens.CLAMPING.textUi - UI text clamping configuration
 * @param {number} designTokens.CLAMPING.textUi.min - Minimum UI text scaling
 * @param {number} designTokens.CLAMPING.textUi.max - Maximum UI text scaling
 *
 * @returns {string} Complete HTML style tag with design system CSS variables
 *
 * @example
 * // +layout.svelte
 * <script>
 * import { designTokens, designTokensToRootCssVars } from '@hkdigital/lib-core/design/index.js';
 * </script>
 *
 * <svelte:head>
 * {@html designTokensToRootCssVars(designTokens)}
 * </svelte:head>
 *
 * // Generates style tag for use in svelte:head
 * // <style>:root { --design-width: 1920; ... }</style>
 */
export function designTokensToRootCssVars(designTokens) {
  const { DESIGN, CLAMPING } = designTokens;

  return `<style>:root {
      /* Design dimensions */
      --design-width: ${DESIGN.width};
      --design-height: ${DESIGN.height};

      /* Scaling factors */
      --scale-w: 1;
      --scale-h: 1;

      /* --scale-viewport: min(var(--scale-w), var(--scale-h)); */
      --scale-viewport: 1;

      /* Base clamping units */
      --scale-ui: clamp(${CLAMPING.ui.min}, var(--scale-viewport), ${CLAMPING.ui.max});
      --scale-text-base: clamp(${CLAMPING.textBase.min}, var(--scale-viewport), ${CLAMPING.textBase.max});
      --scale-text-heading: clamp(${CLAMPING.textHeading.min}, var(--scale-viewport), ${CLAMPING.textHeading.max});
      --scale-text-ui: clamp(${CLAMPING.textUi.min}, var(--scale-viewport), ${CLAMPING.textUi.max});
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
 * Extract a CSS variable value from document root (exported for use by other design system utilities)
 *
 * @param {string} varName - CSS variable name without '--'
 * @param {boolean} [useCache=false]
 *
 * @returns {any} Parsed value or default
 */
export { getRootCssVar };

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
