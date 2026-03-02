/**
 * Create language utilities configured with your app config
 *
 * @param {Object} config - Configuration object
 * @param {Record<string, {lang: string, locale: string}>} config.languages
 *   Language configurations
 * @param {string} config.defaultLanguage - Default language code
 * @param {string} config.name - App name (for %title% injection)
 * @param {string} config.description - App description
 *
 * @returns {{
 *   getLangFromPath: Function,
 *   injectLang: Function,
 *   handleLang: Function
 * }}
 */
export function createLangUtils(config) {
  const { languages, defaultLanguage, name, description } = config;

  /**
   * Extract language code from URL pathname
   *
   * @param {string} pathname - URL pathname (e.g., '/en/shop')
   *
   * @returns {{
   *   langCode: string,
   *   lang: string,
   *   locale: string
   * }}
   */
  function getLangFromPath(pathname) {
    const match = pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\//i);
    const langCode = match ? match[1].toLowerCase() : defaultLanguage;

    const langConfig = languages[langCode] || languages[defaultLanguage];

    return {
      langCode,
      lang: langConfig.lang,
      locale: langConfig.locale
    };
  }

  /**
   * Transform HTML to inject language, title, and description
   *
   * @param {string} html - HTML string with placeholders
   * @param {string} lang - Language code (e.g., 'en-GB')
   *
   * @returns {string} HTML with values injected
   */
  function injectLang(html, lang) {
    return html
      .replace('%lang%', lang)
      .replace('%title%', name)
      .replace('%description%', description);
  }

  /**
   * SvelteKit hook handler for language detection
   *
   * @param {object} event - SvelteKit event object
   * @param {Function} resolve - SvelteKit resolve function
   *
   * @returns {Promise<Response>}
   */
  async function handleLang(event, resolve) {
    const { langCode, lang, locale } = getLangFromPath(event.url.pathname);

    event.locals.langCode = langCode;
    event.locals.lang = lang;
    event.locals.locale = locale;

    return resolve(event, {
      transformPageChunk: ({ html }) => injectLang(html, lang)
    });
  }

  return {
    getLangFromPath,
    injectLang,
    handleLang
  };
}
