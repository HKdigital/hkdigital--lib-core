import { languages, defaultLanguage, name, description } from './config.js';

/**
 * Extract language code from URL pathname
 *
 * Supports both short codes (e.g., /en/) and explicit variants
 * (e.g., /en-us/)
 *
 * @param {string} pathname - URL pathname (e.g., '/en/shop')
 *
 * @returns {{
 *   langCode: string,
 *   lang: string,
 *   locale: string
 * }} Language configuration
 *
 * @example
 * getLangFromPath('/en/shop')
 * // => { langCode: 'en', lang: 'en-GB', locale: 'en_GB' }
 *
 * getLangFromPath('/en-us/shop')
 * // => { langCode: 'en-us', lang: 'en-US', locale: 'en_US' }
 */
export function getLangFromPath(pathname) {
  // Match both /en/ and /en-us/ patterns
  const match = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\//i);
  const langCode = match ? match[1].toLowerCase() : defaultLanguage;

  // Get language config or fall back to default
  const config = languages[langCode] || languages[defaultLanguage];

  return {
    langCode,
    lang: config.lang,
    locale: config.locale
  };
}

/**
 * Transform HTML to inject language, title, and description
 *
 * Replaces %lang%, %title%, and %description% placeholders with actual
 * values. Use this in hooks.server.js transformPageChunk.
 *
 * @param {string} html - HTML string with placeholders
 * @param {string} lang - Language code (e.g., 'en-GB')
 *
 * @returns {string} HTML with values injected
 */
export function injectLang(html, lang) {
  return html
    .replace('%lang%', lang)
    .replace('%title%', name)
    .replace('%description%', description);
}

/**
 * SvelteKit hook handler for language detection
 *
 * Use this in hooks.server.js to automatically detect and inject
 * language based on URL path.
 *
 * @param {object} event - SvelteKit event object
 * @param {Function} resolve - SvelteKit resolve function
 *
 * @returns {Promise<Response>}
 *
 * @example
 * // hooks.server.js
 * import { handleLang } from './routes/(meta)/lang.js';
 *
 * export async function handle({ event, resolve }) {
 *   return handleLang(event, resolve);
 * }
 */
export async function handleLang(event, resolve) {
  const { langCode, lang, locale } = getLangFromPath(event.url.pathname);

  // Make available to load functions and server-side code
  event.locals.langCode = langCode;
  event.locals.lang = lang;
  event.locals.locale = locale;

  return resolve(event, {
    transformPageChunk: ({ html }) => injectLang(html, lang)
  });
}
