/**
 * @typedef {Object} SitemapRouteObject
 * @property {string} path - Route path (e.g., '/about')
 * @property {number} [priority] - Priority (0.0 to 1.0)
 * @property {'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'}
 *   [changefreq] - Change frequency
 */

/**
 * @typedef {string | SitemapRouteObject} SitemapRoute
 *   Route can be a simple string path or an object with details
 */

export default {};
