/**
 * @typedef {object} ImageMeta
 * @property {string} src
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {ImageMeta | ImageMeta[]} ImageSource
 * Single ImageMeta object or array of ImageMeta objects
 */

/**
 * @typedef {"center" | "top" | "bottom" | "left" | "right" |
 *          "left top" | "left center" | "left bottom" |
 *          "center top" | "center center" | "center bottom" |
 *          "right top" | "right center" | "right bottom" |
 *          string} ObjectPosition
 *
 * @description Accepts valid CSS object-position values including:
 * - Keywords: "center", "top", "bottom", "left", "right"
 * - Length values: "10px", "2em", "50%", etc.
 * - Percentage values: "25%", "100%", etc.
 * - Two-value combinations: "left top", "center bottom", "25% 75%"
 * - Mixed units: "left 20px", "10% center", "2em 50%"
 *
 * @example
 * "center"           // Single keyword (centers both axes)
 * "top"              // Single keyword
 * "left center"      // Two keywords
 * "25% 75%"          // Two percentages
 * "10px 20px"        // Two lengths
 * "left 25%"         // Keyword + percentage
 * "50% top"          // Percentage + keyword
 * "2em center"       // Length + keyword
 */

export default {};
