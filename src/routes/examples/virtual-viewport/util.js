/**
 * Provides component-level text scaling functionality
 * @module componentTextScaler
 */

// import { normalizeCssVariableName } from '$lib/util/css/index.js';

/**
 * Sets component-specific text scaling by modifying only the --scale-text variable
 * @param {HTMLElement} element - The component element to scale
 * @param {number} factor - Scaling factor (1 = default, 1.5 = 50% larger, etc.)
 * @returns {boolean} Success status
 */
export function setComponentTextScale(element, factor) {
  try {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('Valid HTML element is required');
    }

    if (typeof factor !== 'number' || factor <= 0) {
      throw new Error('Scale factor must be a positive number');
    }

    // Simply set the scale-text factor directly as a unitless value
    element.style.setProperty('--scale-text', factor.toString());

    return true;
  } catch (error) {
    console.error('Error setting component text scale:', error);
    return false;
  }
}

/**
 * Resets component text scaling to global defaults
 * @param {HTMLElement} element - The component to reset
 * @returns {boolean} Success status
 */
export function resetComponentTextScale(element) {
  try {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('Valid HTML element is required');
    }

    // Simply remove the scale-text override
    element.style.removeProperty('--scale-text');

    return true;
  } catch (error) {
    console.error('Error resetting component text scale:', error);
    return false;
  }
}
