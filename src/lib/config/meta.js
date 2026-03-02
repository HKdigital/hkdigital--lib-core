/**
 * Meta data configuration
 */

export const name = 'HKdigital Lib Core Test';
export const shortName = 'HKlib Core';  // max 12 characters

export const description = 'Base library that powers up Sveltekit projects';

/**
 * Language and locale configuration
 *
 * Configure supported languages with their locale mappings.
 * Short codes (e.g., 'en') are defaults, explicit variants optional.
 *
 * @type {Record<string, {lang: string, locale: string}>}
 */
export const languages = {
  // Short codes (defaults)
  'en': { lang: 'en-GB', locale: 'en_GB' },
  'nl': { lang: 'nl-NL', locale: 'nl_NL' },

  // Explicit variants (add as needed)
  // 'en-us': { lang: 'en-US', locale: 'en_US' },
  // 'es': { lang: 'es-ES', locale: 'es_ES' },
  // 'es-mx': { lang: 'es-MX', locale: 'es_MX' }
};

/**
 * Default language code (fallback)
 *
 * @type {string}
 */
export const defaultLanguage = 'en';

/**
 * Default locale (derived from defaultLanguage)
 *
 * @type {string}
 */
export const defaultLocale = languages[defaultLanguage].locale;

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
 * SEO social media preview images
 *
 * To enable: Import the image and export it
 * To disable: Comment out the import and export null instead
 *
 * Processed dimensions:
 * - Landscape: 1200×630 (Facebook, LinkedIn, Discord)
 * - Square: 1200×1200 (various platforms)
 */

// Import and export processed images
import SeoLandscapeImg from '$lib/assets/meta/preview-landscape.png?seo-landscape';
import SeoSquareImg from '$lib/assets/meta/preview-square.png?seo-square';

export const SeoImageLandscape = SeoLandscapeImg;
export const SeoImageSquare = SeoSquareImg;

// To disable, comment out imports above and uncomment below:
// export const SeoImageLandscape = null;
// export const SeoImageSquare = null;

/**
 * Favicon images (processed by Vite imagetools)
 */
import FaviconImgs from '$lib/assets/meta/favicon.png?favicons';
import AppleTouchImgs from '$lib/assets/meta/favicon.png?apple-touch-icons';

export const faviconImages = FaviconImgs;
export const appleTouchIcons = AppleTouchImgs;

/**
 * Site routes for sitemap.xml
 *
 * @type {import('@hkdigital/lib-core/meta/typedef.js').SitemapRoute[]}
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
 * @type {import('@hkdigital/lib-core/meta/typedef.js').RobotsConfig}
 *
 * @see hkdigital/lib-core/meta/README.md for detailed configuration options
 */
export const robotsConfig = {
  allowedHosts: '*',       // '*' allows all hosts
  disallowedPaths: [],     // e.g., ['/admin', '/api']

  // AI bot control (site-wide via robots.txt)
  allowAiTraining: true,   // GPTBot, Google-Extended, CCBot, anthropic-ai
  allowAiReading: true     // ChatGPT-User, Claude-Web, cohere-ai
};

