/**
 * Creates utility classes for UI font styling that work with Skeleton themes
 *
 * This plugin adds utility classes for UI typography that reference CSS
 * variables defined in your Skeleton theme, allowing consistent styling of UI
 * elements across your application.
 *
 * @note Important Configuration Requirements:
 * 1. Add UI font variables to your theme file:
 *    - `--ui-font-family`: Font family for UI elements
 *      (falls back to `--base-font-family`)
 *    - `--ui-font-color`: Text color for UI elements
 *      (falls back to `--base-font-color`)
 *    - `--ui-font-color-dark`: Dark mode text color
 *      (falls back to `--base-font-color-dark`)
 *
 * 2. This plugin generates the following utility classes:
 *    - `font-ui`: Applies UI font family
 *    - `text-ui`: Applies UI text color
 *    - `text-ui-dark`: Applies UI dark mode text color (with .dark selector)
 *
 * @example
 * // tailwind.config.js
 * import { customUtilitiesPlugin }
 *   from './src/lib/util/design-system/skeleton.js';
 *
 * export default {
 *   plugins: [
 *     customUtilitiesPlugin,
 *     skeleton({
 *       themes: [defaultThemes.cerberus, customThemes.yourTheme]
 *     })
 *   ]
 * };
 *
 * @param {Object} api - Tailwind plugin API
 * @param {Function} api.addUtilities - Function to add utilities
 */
export function customUtilitiesPlugin({ addUtilities, theme }) {
  const fontFamilyUtilities = {
    '.font-heading': {
      'font-family': 'var(--heading-font-family)'
    },
    '.font-base': {
      'font-family': 'var(--base-font-family)'
    },
    '.font-ui': {
      'font-family': 'var(--ui-font-family, var(--base-font-family))'
    }
  };

  const textColorUtilities = {
    '.text-base-color': {
      color: 'var(--base-font-color)'
    },
    '.text-base-color-dark': {
      color: 'var(--base-font-color-dark)'
    },
    '.text-heading-color': {
      color: 'var(--heading-font-color)'
    },
    '.text-heading-color-dark': {
      color: 'var(--heading-font-color-dark)'
    },
    '.text-ui-color': {
      color: 'var(--ui-font-color, var(--base-font-color))'
    },
    '.text-ui-color-dark': {
      color: 'var(--ui-font-color-dark, var(--base-font-color-dark))'
    }
  };

  const typographyUtilities = generateTypographyUtilities(theme);

  addUtilities({
    ...typographyUtilities,
    ...fontFamilyUtilities,
    ...textColorUtilities
  });
}

/**
 * Generates typography utility classes based on fontSize entries in the
 * Tailwind theme
 *
 * This function creates typography utility classes for entries in the
 * theme's fontSize configuration that start with 'heading-', 'base-', or
 * 'ui-' prefixes. Each class includes font size, line height, font weight,
 * font family, and color properties.
 *
 * @param {Function} theme - Tailwind's theme function to access configuration
 * @returns {Object} An object containing the generated typography utility classes
 *
 * @example
 * // In your Tailwind plugin:
 * const typographyUtils = generateTypographyUtilities(theme);
 * addUtilities(typographyUtils);
 *
 * @example
 * // Example output format:
 * // {
 * //   '.type-heading-h1': {
 * //     fontSize: 'calc(32px * var(--scale-text-heading))',
 * //     lineHeight: '1.25',
 * //     fontWeight: '700',
 * //     fontFamily: 'var(--heading-font-family)',
 * //     fontStyle: 'var(--heading-font-style)',
 * //     letterSpacing: 'var(--heading-letter-spacing)',
 * //     color: 'rgb(var(--heading-font-color))'
 * //   }
 * // }
 */
function generateTypographyUtilities(theme) {
  // Get font sizes from theme
  const fontSizes = theme('fontSize');

  // Create typography utilities
  const typographyUtilities = {};

  // Process all fontSize entries and create type- classes for them
  Object.entries(fontSizes).forEach(([key, value]) => {
    // Skip entries that don't match our prefixes
    if (
      !key.startsWith('heading-') &&
      !key.startsWith('base-') &&
      !key.startsWith('ui-')
    ) {
      return;
    }

    const [size, options] = Array.isArray(value) ? value : [value, {}];

    // Determine properties based on the prefix
    let properties = {};

    let propertiesDark;

    if (key.startsWith('heading-')) {
      properties = {
        lineHeight: options.lineHeight || 'normal',
        fontFamily: 'var(--heading-font-family)',
        fontStyle: 'var(--heading-font-style)',
        fontWeight: 'var(--heading-font-weight)',
        letterSpacing: 'var(--heading-letter-spacing)',
        color: 'var(--heading-font-color)'
      };

      propertiesDark = {
        ...properties,
        color: 'var(--heading-font-color-dark)'
      };
    } else if (key.startsWith('base-')) {
      properties = {
        lineHeight: options.lineHeight || 'normal',
        fontFamily: 'var(--base-font-family)',
        fontWeight: 'var(--base-font-weight)',
        letterSpacing: 'var(--base-letter-spacing)',
        color: 'var(--base-font-color)'
      };

      propertiesDark = {
        ...properties,
        color: 'var(--base-font-color-dark)'
      };
    } else if (key.startsWith('ui-')) {
      properties = {
        lineHeight: options.lineHeight || 'normal',
        fontFamily: 'var(--ui-font-family, var(--base-font-family))',
        fontWeight: 'var(--ui-font-weight)',
        letterSpacing: 'var(--ui-letter-spacing, var(--base-letter-spacing))',
        color: 'var(--ui-font-color, var(--base-font-color))'
      };

      propertiesDark = {
        ...properties,
        color: 'var(--ui-font-color-dark, var(--base-font-color-dark))'
      };
    }

    // Create the utility class using the original key
    typographyUtilities[`.type-${key}`] = {
      fontSize: size,
      ...properties,
      // Include any other properties defined in the fontSize options
      ...Object.fromEntries(
        Object.entries(options).filter(
          ([k]) => !['lineHeight'].includes(k)
        )
      )
    };

    // Create the utility class using the original key for dark
    typographyUtilities[`.type-${key}-dark`] = {
      fontSize: size,
      ...propertiesDark,
      // Include any other properties defined in the fontSize options
      ...Object.fromEntries(
        Object.entries(options).filter(
          ([k]) => !['lineHeight'].includes(k)
        )
      )
    };
  });

  // console.debug(typographyUtilities);

  return typographyUtilities;
}
