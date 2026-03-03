/**
 * Type definitions for meta utilities
 */

// Re-export robots typedefs
export * from './utils/robots/typedef.js';

// Re-export sitemap typedefs
export * from './utils/sitemap/typedef.js';

/**
 * @typedef {Object} MetaConfig
 *
 * App identity
 * @property {string} name - Full app name
 * @property {string} shortName - Short app name (max 12 characters)
 * @property {string} description - App description for search engines
 *
 * Language and locale
 * @property {Record<string, {lang: string, locale: string}>} languages
 *   Language configurations
 * @property {string} defaultLanguage - Default language code
 * @property {string} defaultLocale - Default locale
 *
 * PWA theme and colors
 * @property {string} backgroundAndThemeColor - Theme color
 * @property {string} themeColor - Theme color for browser UI
 * @property {string} backgroundColor - Background color
 * @property {string} statusBarStyle - iOS status bar style
 * @property {string} orientation - Screen orientation
 * @property {boolean} disablePageZoom - Disable pinch-to-zoom
 *
 * SEO images
 * @property {import('$lib/config/typedef.js').ImageSource} [previewImageLandscape]
 *   Landscape SEO image URL (1200×630)
 *
 * @property {import('$lib/config/typedef.js').ImageSource} [previewImageSquare]
 *   Square SEO image URL (1200×1200)
 *
 * @property {string} [previewImageAltText] - Alt text for social media image
 *
 * Favicon images (processed by imagetools)
 * @property {Array<{src: string, width: number}>} faviconImages
 *   Processed favicon images
 * @property {Array<{src: string, width: number}>} appleTouchIcons
 *   Processed apple-touch-icon images
 *
 * Site configuration
 * @property {import('./utils/sitemap/typedef.js').SitemapRoute[]} siteRoutes
 *   Routes for sitemap.xml
 *
 * @property {import('./utils/robots/typedef.js').RobotsConfig} robotsConfig
 *   Robots.txt configuration
 */
