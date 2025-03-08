/**
 * Generates text-based spacing units with with different scaling
 * units (ut, bt, ht)
 *
 * @param {number[]} values
 *   Array of pixel values to generate text-based spacing units for
 *
 * @returns {{[key: string]: string}}
 *   Generated text-based spacing units with ut, bt, and ht suffixes
 *
 * @throws {Error} If values is not an array or contains non-numeric values
 *
 * @example
 * generateTextBasedSpacing([1, 2, 4, 8])
 * // Returns:
 * // {
 * //   '1ut': 'calc(1px * var(--scale-text-ui))',
 * //   '2ut': 'calc(2px * var(--scale-text-ui))',
 * //   '1bt': 'calc(1px * var(--scale-text-base))',
 * //   '2bt': 'calc(2px * var(--scale-text-base))',
 * //   '1ht': 'calc(1px * var(--scale-text-heading))',
 * //   '2ht': 'calc(2px * var(--scale-text-heading))'
 * // }
 */
export function generateTextBasedSpacing(values) {
  if (!Array.isArray(values)) {
    throw new Error('values must be an array');
  }

  return values.reduce((units, value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid spacing value: ${value}. Must be a number.`);
    }

    // Generate UI text spacing units
    units[`${value}ut`] = `calc(${value}px * var(--scale-text-ui))`;

    // Generate base text spacing units
    units[`${value}bt`] = `calc(${value}px * var(--scale-text-base))`;

    // Generate heading text spacing units
    units[`${value}ht`] = `calc(${value}px * var(--scale-text-heading))`;

    return units;
  }, {});
}

/**
 * Generates viewport-based spacing units with different scaling
 * units (up, wp, hp)
 *
 * @param {number[]} values
 *   Array of pixel values to generate viewport-based spacing units for
 *
 * @returns {Object.<string, string>}
 *   Generated viewport-based spacing units:
 *   - up: UI points (clamped scaling)
 *   - p:  UI points (deprecated, will be removed in future versions)
 *   - wp: Width points
 *   - hp: Height points
 *
 * @throws {Error} If values is not an array or contains non-numeric values
 *
 * @example
 * generateViewportBasedSpacing([1, 2, 4])
 * // Returns:
 * // {
 * //   '1up': 'calc(1px * var(--scale-ui))',
 * //   '1p': 'calc(1px * var(--scale-ui))',  // deprecated
 * //   '1wp': 'calc(1px * var(--scale-w))',
 * //   '1hp': 'calc(1px * var(--scale-h))'
 * // }
 */
export function generateViewportBasedSpacing(values) {
  if (!Array.isArray(values)) {
    throw new Error('values must be an array');
  }

  return values.reduce((units, value) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Invalid spacing value: ${value}. Must be a number.`);
    }

    // Width points
    units[`${value}wp`] = `calc(${value}px * var(--scale-w))`;
    // Height points
    units[`${value}hp`] = `calc(${value}px * var(--scale-h))`;
    // UI points (standard)
    units[`${value}up`] = `calc(${value}px * var(--scale-ui))`;
    // UI points (deprecated)
    units[`${value}p`] = `calc(${value}px * var(--scale-ui))`;
    return units;
  }, {});
}

/**
 * Generates semantic text style definitions for a specific text category
 * (base, UI, or heading). Each style includes a scaled font size and
 * line height.
 *
 * @param {{[key: string]: {size: number, lineHeight?: number}}} sizes
 *   Set of text sizes to generate styles for
 *
 * @param {'base' | 'ui' | 'heading'} category
 *   Text category to generate styles for
 *
 * @returns {{[key: string]: [string, {lineHeight: number}]}}
 *   Generated text styles in Tailwind format
 *
 * @throws {Error} If a size has an invalid size or lineHeight
 *
 * @example
 * const TEXT_BASE_SIZES = {
 *   sm: { size: 16, lineHeight: 1.5 },
 *   base: { size: 20, lineHeight: 1.5 },
 *   lg: { size: 24, lineHeight: 1.4 }
 * };
 *
 * generateTextStyles(TEXT_BASE_SIZES, 'base');
 * // Returns:
 * // {
 * //   'base-sm':
 * //     ['calc(16px * var(--scale-text-base))', { lineHeight: 1.5 }],
 * //   'base-base':
 * //     ['calc(20px * var(--scale-text-base))', { lineHeight: 1.5 }],
 * //   'base-lg':
 * //     ['calc(24px * var(--scale-text-base))', { lineHeight: 1.4 }]
 * // }
 */
export function generateTextStyles(sizes, category) {
  if (!sizes || typeof sizes !== 'object') {
    throw new Error('sizes must be an object');
  }

  if (!['base', 'ui', 'heading'].includes(category)) {
    throw new Error('category must be one of: base, ui, heading');
  }

  return Object.entries(sizes).reduce((result, [variant, config]) => {
    // Validate config
    if (!config || typeof config !== 'object') {
      throw new Error(
        `Invalid size config for "${variant}": must be an object`
      );
    }

    if (typeof config.size !== 'number') {
      throw new Error(
        `Invalid size for "${category}-${variant}": must be a number`
      );
    }

    if (
      config.lineHeight !== undefined &&
      typeof config.lineHeight !== 'number'
    ) {
      throw new Error(
        `Invalid lineHeight for "${category}-${variant}": must be a number`
      );
    }

    const { size, lineHeight = 1.5 } = config;

    result[`${category}-${variant}`] = [
      `calc(${size}px * var(--scale-text-${category}))`,
      { lineHeight }
    ];

    return result;
  }, {});
}

/**
 * Generates border radius styles with UI scaling
 *
 * @param {{[key: string]: string | {size: number}}} sizes
 *   Set of radius sizes to generate, either as:
 *   - Object with size property (e.g., { size: 10 })
 *   - Direct string value (e.g., '0px', '9999px')
 *
 * @returns {Object.<string, string>}
 *   Generated border radius styles in Tailwind format
 *
 * @throws {Error} If a value has an invalid type
 *
 * @example
 * const RADIUS_SIZES = {
 *   none: '0px',
 *   sm: { size: 10 },
 *   md: { size: 15 },
 *   full: '9999px'
 * };
 *
 * generateBorderRadiusStyles(RADIUS_SIZES)
 * // Returns:
 * // {
 * //   'none': '0px',
 * //   'sm': 'calc(10px * var(--scale-ui))',
 * //   'md': 'calc(15px * var(--scale-ui))',
 * //   'full': '9999px'
 * // }
 */
export function generateBorderRadiusStyles(sizes) {
  if (!sizes || typeof sizes !== 'object') {
    throw new Error('sizes must be an object');
  }

  return Object.entries(sizes).reduce((result, [variant, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle {size: 10} format
      if (typeof value.size !== 'number') {
        throw new Error(
          `Invalid radius size for "${variant}": size must be a number`
        );
      }
      result[variant] = `calc(${value.size}px * var(--scale-ui))`;
    } else if (typeof value === 'string') {
      // Handle direct strings (like '0px' or '9999px')
      result[variant] = value;
    } else {
      throw new Error(
        `Invalid radius value for "${variant}": ` +
          `must be an object with size property or a string`
      );
    }
    return result;
  }, {});
}

/**
 * Generates width styles for various CSS properties with UI scaling and explicit naming
 *
 * @param {{[key: string]: {size: number}}} sizes
 *   Set of width sizes to generate
 *
 * @param {string} [prefix='width']
 *   Prefix to add before each variant name (default: 'width')
 *
 * @param {string} scaleVar
 *   CSS variable to use for scaling (default: '--scale-ui')
 *
 * @returns {{[key: string]: string}}
 *   Generated width styles in Tailwind format
 *
 * @throws {Error} If a size has an invalid type
 *
 * @example
 * const WIDTH_SIZES = {
 *   thin: { size: 1 },
 *   normal: { size: 2 },
 *   thick: { size: 4 }
 * };
 *
 * generateWidthStyles(WIDTH_SIZES, 'width')
 * // Returns:
 * // {
 * //   'width-thin': 'calc(1px * var(--scale-ui))',
 * //   'width-normal': 'calc(2px * var(--scale-ui))',
 * //   'width-thick': 'calc(4px * var(--scale-ui))'
 * // }
 */
export function generateWidthStyles(
  sizes,
  prefix = 'width',
  scaleVar = '--scale-ui'
) {
  if (!sizes || typeof sizes !== 'object') {
    throw new Error('sizes must be an object');
  }

  return Object.entries(sizes).reduce((result, [variant, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (typeof value.size !== 'number') {
        throw new Error(
          `Invalid width size for "${variant}": size must be a number`
        );
      }

      result[`${prefix}${prefix.length ? '-' : ''}${variant}`] =
        `calc(${value.size}px * var(${scaleVar}))`;
    } else {
      throw new Error(
        `Invalid width value for "${variant}": ` +
          `must be an object with size property`
      );
    }
    return result;
  }, {});
}

/**
 * Generates font family styles for different text categories
 * with fallbacks to base properties when needed
 *
 * @returns {Object.<string, string>} Generated font family styles
 *
 * @example
 * // Returns:
 * // {
 * //   'ui': 'var(--ui-font-family, var(--base-font-family))'
 * // }
 */
export function generateFontFamilyStyles() {
  return {
    // UI font family with fallback to base font family
    ui: 'var(--ui-font-family, var(--base-font-family))'
  };
}

/**
 * Generates text color styles for different text categories
 * with fallbacks to base properties when needed
 *
 * @returns {Object.<string, Object.<string, string>>} Generated text color styles
 *
 * @example
 * // Returns:
 * // {
 * //   'ui': {
 * //     'DEFAULT': 'var(--ui-font-color, var(--base-font-color))',
 * //     'dark': 'var(--ui-font-color-dark, var(--base-font-color-dark))'
 * //   }
 * // }
 */
export function generateTextColorStyles() {
  return {
    // UI text color with fallbacks
    ui: {
      // Default color (light mode)
      DEFAULT: 'var(--ui-font-color, var(--base-font-color))',
      // Dark mode color
      dark: 'var(--ui-font-color-dark, var(--base-font-color-dark))'
    }
  };
}
