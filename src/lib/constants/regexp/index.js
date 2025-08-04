/**
 * Index file for various regexp categories
 *
 * @note
 * To enable unicode search, use the unicode flag 'u'.
 *
 * \p and \P are only supported in Unicode-aware mode. In Unicode-unaware mode,
 * they are identity escapes for the p or P character.
 *
 * @note
 * To enable unicode symbols that consist of multiple 'code points'(characters),
 * such a some emoji, you must use the flag 'v'.
 *
 * @eg
 * const re = new RegExp('^(?:${Latin_Number})', 'v');
 *
 * @eg
 * const re = new RegExp('^[${Symbols_Emoji}]', 'v');
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/
 *      Reference/Regular_expressions/Unicode_character_class_escape
 *
 * @see https://javascript.info/regexp-unicode
 *
 * @see https://v8.dev/features/regexp-v-flag
 *
 * @see https://www.regular-expressions.info/unicode.html
 */
export * from './text.js';
export * from './user.js';
export * from './url.js';
