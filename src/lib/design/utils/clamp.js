import { getRootCssVar } from './root-vars.js';

/**
 * Cache to that ensures we parse CSS clamp parameters only once
 * @type {Object.<string, {min: number, max: number}>}
 */
let clampParamCache = {};

/**
 * Extract clamp parameters from a CSS variable
 *
 * @param {string} varName - CSS variable name without '--'
 * @returns {Object} Object with min and max values
 * @throws {Error} If the CSS variable doesn't exist or doesn't contain a valid clamp function
 */
export function getClampParams(varName) {
  // Check cache first
  if (clampParamCache[varName]) {
    return clampParamCache[varName];
  }

  // Get the CSS variable value using the existing utility
  const declaration = getRootCssVar(varName);

  if (declaration === null) {
    throw new Error(`CSS variable --${varName} not found`);
  }

  // Parse clamp() function values
  const clampMatch =
    typeof declaration === 'string'
      ? declaration.match(
          /clamp\s*\(\s*([\d.]+)\s*,\s*[^,]+\s*,\s*([\d.]+)\s*\)/
        )
      : null;

  if (!clampMatch || clampMatch.length < 3) {
    // console.log(declaration);
    throw new Error(
      `CSS variable --${varName} does not contain a valid clamp function`
    );
  }

  const min = parseFloat(clampMatch[1]);
  const max = parseFloat(clampMatch[2]);

  if (isNaN(min) || isNaN(max)) {
    throw new Error(`Invalid min/max values in CSS variable --${varName}`);
  }

  // Cache the result
  clampParamCache[varName] = { min, max };
  return { min, max };
}

/**
 * CSS clamp function implementation
 *
 * @param {number} min - Minimum value
 * @param {number} value - Value to clamp
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max));
}
