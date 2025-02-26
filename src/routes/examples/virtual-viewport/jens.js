/**
 * Manages CSS variables defined in :root
 * @module cssVariableManager
 */

/**
 * Gets the current value of a CSS variable from :root
 * @param {string} variableName - The CSS variable name (with or without --)
 * @returns {string|null} The current value or null if not found
 */
export function getCssVariable(variableName) {
  try {
    // Ensure variable name has -- prefix
    const normalizedName = variableName.startsWith('--')
      ? variableName
      : `--${variableName}`;

    const rootStyles = getComputedStyle(document.documentElement);
    const value = rootStyles.getPropertyValue(normalizedName).trim();
    return value || null;
  } catch (error) {
    console.error(`Error reading CSS variable ${variableName}:`, error);
    return null;
  }
}

/**
 * Sets a CSS variable in :root to a new value
 * @param {string} variableName - The CSS variable name (with or without --)
 * @param {string|number} value - The new value to set
 * @returns {boolean} True if successful, false otherwise
 */
export function setCssVariable(variableName, value) {
  try {
    if (variableName === undefined || variableName === null) {
      throw new Error('Variable name cannot be null or undefined');
    }

    if (value === undefined || value === null) {
      throw new Error('Value cannot be null or undefined');
    }

    // Ensure variable name has -- prefix
    const normalizedName = variableName.startsWith('--')
      ? variableName
      : `--${variableName}`;

    // Convert to string if numeric
    const formattedValue = typeof value === 'number' ? `${value}` : value;

    document.documentElement.style.setProperty(normalizedName, formattedValue);
    return true;
  } catch (error) {
    console.error(`Error setting CSS variable ${variableName}:`, error);
    return false;
  }
}

// Example usage specific to scale-text
export const getScaleText = () => getCssVariable('scale-text');
export const setScaleText = (value) => setCssVariable('scale-text', value);
