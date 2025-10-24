/**
 * @typedef {Object} RobotsConfig
 * @property {string[] | '*'} [allowedHosts]
 *   Allowed host patterns. Use '*' or omit to allow all hosts.
 *   Supports wildcards (e.g., '*.example.com')
 * @property {string[]} [disallowedPaths]
 *   Paths to block from indexing (e.g., '/admin', '/api/*')
 * @property {boolean} [includeSitemap]
 *   Include sitemap reference in robots.txt (default: true)
 */

export default {};
