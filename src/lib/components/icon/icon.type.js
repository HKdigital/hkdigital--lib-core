/**
 * @typedef {'path' | 'circle' | 'rect' | 'polygon' | 'polyline' | 'line'} AllowedTags
 */

/**
 * @typedef { { a: { [attribute: string]: string }} &
 *            { [tag in AllowedTags]?: { [attribute: string]: string }[] }
 *   } IconThemeSource
 */

/**
 * @typedef {{[theme: string]: IconThemeSource}} IconSource
 */

// Export default is required for exporting typedefs
export default {};
