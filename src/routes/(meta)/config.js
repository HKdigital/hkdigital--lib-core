/**
 * Meta data configuration
 */

export const name = 'HKdigital Lib Core Test';
export const shortName = 'HKlib Core';  // max 12 characters

export const description = 'Base library that powers up Sveltekit projects';

export const backgroundAndThemeColor = '#082962';

export const themeColor = backgroundAndThemeColor;
export const backgroundColor = backgroundAndThemeColor;

export const statusBarStyle = 'black-translucent';

export const orientation = 'any'; // "landscape"

//
// Only disable zoom if:
// - You're building a game
// - Canvas-based app where zoom breaks functionality
// - You have a very specific (technical) reason...
//
export const disablePageZoom = true;

/**
 * Site routes configuration
 *
 * Simple format: Just list your routes as strings
 * - Root '/' gets priority 1.0 and changefreq 'daily'
 * - Other routes get priority 0.8 and changefreq 'weekly'
 *
 * Advanced format: Override defaults with object notation
 *
 * @type {Array<string | {
 *   path: string,
 *   priority?: number,
 *   changefreq?: 'always'|'hourly'|'daily'|'weekly'|'monthly'|'yearly'|'never'
 * }>}
 *
 * @example
 * // Simple format (recommended)
 * export const siteRoutes = [
 *   '/',
 *   '/about',
 *   '/contact'
 * ];
 *
 * @example
 * // Mixed format with custom settings
 * export const siteRoutes = [
 *   '/',
 *   '/about',
 *   { path: '/blog', priority: 0.9, changefreq: 'daily' },
 *   { path: '/legal', priority: 0.3, changefreq: 'yearly' }
 * ];
 */
export const siteRoutes = [
  '/' // Root path (homepage) - recommended to always include
  // Add more routes as needed:
  // '/about',
  // '/contact',
  // { path: '/blog', priority: 0.9, changefreq: 'daily' }
];

/**
 * Robots.txt configuration
 *
 * Control which hosts can be indexed and which paths to block
 *
 * @type {{
 *   allowedHosts?: string[] | '*',
 *   disallowedPaths?: string[],
 *   includeSitemap?: boolean
 * }}
 *
 * @example
 * // Allow only production domains
 * export const robotsConfig = {
 *   allowedHosts: [
 *     'mysite.com',
 *     'www.mysite.com',
 *     '*.mysite.com'  // Wildcard for subdomains
 *   ],
 *   disallowedPaths: ['/admin/*', '/api/*'],
 *   includeSitemap: true
 * };
 *
 * @example
 * // Allow all hosts (default if omitted or set to '*')
 * export const robotsConfig = {
 *   allowedHosts: '*',  // or omit entirely
 *   disallowedPaths: ['/admin/*']
 * };
 */
export const robotsConfig = {
  // If omitted or '*', all hosts are allowed
  // Otherwise only listed hosts (with wildcard support) are indexed
  allowedHosts: '*',

  // Paths to block from indexing (supports wildcards)
  disallowedPaths: [],

  // Include sitemap reference (only if host is allowed)
  includeSitemap: true
};

