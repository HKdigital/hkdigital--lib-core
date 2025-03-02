let cssVarCache = {};

/**
 * Normalizes a CSS variable name to ensure it has the -- prefix
 *
 * @param {string} varName - The CSS variable name
 * @returns {string} Normalized variable name with -- prefix
 */
export function normalizeCssVarName(varName) {
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
export function getRootCssVar(varName, useCache = false) {
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
export function setRootCssVar(varName, value) {
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
