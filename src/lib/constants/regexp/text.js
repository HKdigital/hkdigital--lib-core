/**
 * Text related regexp's
 *
 * Letter (any language): \p{L}
 * Letter latin: \p{Script=Latin}
 *
 * Number (any language): \p{N}
 * Number (exclude letter numbers, e.g. roman): \p{Nd}
 *
 * @example
 * import { Latin_Char_Number as lcn } from './latin.js';
 * export const User_Username = `^[${lcn}]+${lcn}_-]{1,38}[${lcn}]$`;
 *
 * const re = new RegExp('^(?:${Latin_Number})', 'v');
 *
 * Emoji:
 *
 * The v flag enables support
 *
 * RGI_Emoji in Unicode is defined as “the subset of all valid emoji
 * (characters and sequences) recommended for general interchange”.
 * With this, we can now match emoji regardless of how many code points
 * they consist of under the hood!
 *
 * @see https://v8.dev/features/regexp-v-flag
 *
 * Punctuation:
 * Puntuation marks are periods, commas, exclamation marks, question marks etc.
 * Astral symbols are emoji
 *
 * @note
 * \p{Punctuation} matches a small subset: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
 * \p{IsPunctuation} matches a wide subset, including e.g. «, », ¿, ¡, §,
 * ¶, ‘, ’, “, ”, and ‽.
 *
 * @see https://stackoverflow.com/questions/4328500/
 *      how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex
 *
 * @see https://en.wikipedia.org/
 *      wiki/Unicode_character_property#General_Category
 */

export const LCHAR = '\\p{Script=Latin}';
export const LNUMBER = '[0-9]';
export const LCHAR_LNUMBER = `${LCHAR}|${LNUMBER}`;

export const EMOJI = '\\p{RGI_Emoji}';
export const PUNCT = '\\p{Punctuation}';
export const PUNCT_RICH = '\\p{P}';
