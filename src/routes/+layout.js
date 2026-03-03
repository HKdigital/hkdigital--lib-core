import { defaultLocale, defaultLanguage, languages } from '$lib/meta/config.js';

/**
 * Root layout load function (universal)
 *
 * Provides language and locale data to all pages.
 * Works in both SSR and client-side contexts.
 *
 * @param {object} params
 * @param {object} [params.locals] - Server locals (SSR only)
 * @param {object} params.url - Current URL
 *
 * @returns {{
 *   lang: string,
 *   locale: string,
 *   langCode: string
 * }}
 */
export async function load({ locals, url }) {
  // Try to get from server locals first (SSR)
  if (locals?.lang) {
    return {
      lang: locals.lang,
      locale: locals.locale,
      langCode: locals.langCode
    };
  }

  // Fallback: detect from URL pathname (client-side, static builds)
  const match = url.pathname.match(/^\/([a-z]{2}(?:-[a-z]{2})?)\//i);
  const langCode = match ? match[1].toLowerCase() : defaultLanguage;
  const config = languages[langCode] || languages[defaultLanguage];

  return {
    lang: config.lang,
    locale: config.locale,
    langCode
  };
}
