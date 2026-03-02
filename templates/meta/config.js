/**
 * Meta configuration
 *
 * Customize this file with your app's information.
 * After copying to your project, update all values below.
 */

/**
 * App identity
 */
export const name = 'Your App Name';
export const shortName = 'YourApp';  // max 12 characters
export const description = 'Your app description for search engines';

/**
 * Language and locale configuration
 *
 * @type {Record<string, {lang: string, locale: string}>}
 */
export const languages = {
  'en': { lang: 'en-GB', locale: 'en_GB' },
  'nl': { lang: 'nl-NL', locale: 'nl_NL' }

  // Add more languages as needed:
  // 'es': { lang: 'es-ES', locale: 'es_ES' },
  // 'en-us': { lang: 'en-US', locale: 'en_US' }
};

export const defaultLanguage = 'en';
export const defaultLocale = languages[defaultLanguage].locale;

/**
 * PWA theme and colors
 */
export const backgroundAndThemeColor = '#082962';
export const themeColor = backgroundAndThemeColor;
export const backgroundColor = backgroundAndThemeColor;

/**
 * iOS PWA configuration
 */
export const statusBarStyle = 'black-translucent';  // 'default' | 'black' | 'black-translucent'

/**
 * Screen orientation
 */
export const orientation = 'any';  // 'any' | 'landscape' | 'portrait'

/**
 * Disable pinch-to-zoom
 *
 * Only enable for games or canvas apps where zoom breaks functionality
 */
export const disablePageZoom = false;

/**
 * SEO social media preview images
 *
 * Replace the image files with your own designs.
 * The images are processed by Vite imagetools to correct dimensions.
 *
 * To disable: comment out imports and set to null
 */
import SeoLandscapeImg from './preview-landscape.png?seo-landscape';
import SeoSquareImg from './preview-square.png?seo-square';

export const SeoImageLandscape = SeoLandscapeImg;  // 1200×630
export const SeoImageSquare = SeoSquareImg;        // 1200×1200

// To disable SEO images:
// export const SeoImageLandscape = null;
// export const SeoImageSquare = null;

/**
 * Favicon images (processed by Vite imagetools)
 */
import FaviconImgs from './favicon.png?favicons';
import AppleTouchImgs from './favicon.png?apple-touch-icons';

export const faviconImages = FaviconImgs;
export const appleTouchIcons = AppleTouchImgs;

/**
 * Site routes for sitemap.xml
 *
 * @type {import('@hkdigital/lib-core/meta/typedef.js').SitemapRoute[]}
 *
 * @see @hkdigital/lib-core/meta/README.md for configuration options
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
 * @see @hkdigital/lib-core/meta/README.md for configuration options
 */
export const robotsConfig = {
  allowedHosts: '*',       // '*' allows all hosts
  disallowedPaths: [],     // e.g., ['/admin', '/api']

  // AI bot control (site-wide via robots.txt)
  allowAiTraining: true,   // GPTBot, Google-Extended, CCBot, anthropic-ai
  allowAiReading: true     // ChatGPT-User, Claude-Web, cohere-ai
};
