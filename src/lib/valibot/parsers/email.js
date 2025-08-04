// > Imports

import * as v from 'valibot';

import { LCHAR_LNUMBER } from '$lib/constants/regexp/index.js';

// > Email Parsers

/**
 * Parser for email addresses with normalization.
 * Trims whitespace and converts to lowercase.
 */
export const Email = v.pipe(
	v.string(),
	v.trim(),
	v.toLowerCase(),
	v.email()
);

/**
 * Parser for email addresses with Latin characters only.
 * Trims whitespace, converts to lowercase, and validates email format.
 * Restricts to Latin characters and numbers for international compatibility.
 */
export const LatinEmail = v.pipe(
	v.string(),
	v.trim(),
	v.toLowerCase(),
	v.regex(
		new RegExp(`^(?:${LCHAR_LNUMBER}|[\\._%+\\-])+@(?:${LCHAR_LNUMBER}|[.\\-])+\\.(?:${LCHAR_LNUMBER}){2,}$`, 'v'),
		'Email address contains non-Latin characters'
	),
	v.email()
);
