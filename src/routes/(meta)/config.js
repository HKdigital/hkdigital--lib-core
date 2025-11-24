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
 * Site routes for sitemap.xml
 *
 * @type {import('@hkdigital/lib-core/meta/sitemap/typedef.js').SitemapRoute[]}
 *
 * @see hkdigital/lib-core/meta/README.md for detailed configuration options
 */
export const siteRoutes = [
  '/'
  // Add your routes:
  // '/about',
  // '/contact',
  // { path: '/blog', priority: 0.9, changefreq: 'daily' }
];

/**
 * Robots.txt configuration
 *
 * @type {import('@hkdigital/lib-core/meta/robots/typedef.js').RobotsConfig}
 *
 * @see hkdigital/lib-core/meta/README.md for detailed configuration options
 */
export const robotsConfig = {
  allowedHosts: '*',     // '*' allows all hosts
  disallowedPaths: []    // e.g., ['/admin', '/api']
};

