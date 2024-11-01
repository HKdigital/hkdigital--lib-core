// > Imports

import * as v from 'valibot';

import {
	RE_FULLNAME,
	RE_NAME,
	RE_USERNAME,
	RE_SURNAME,
	RE_PHONENUMBER
} from '../constants/regexp/index.js';

// > Exports

export const Name = v.pipe(v.string(), v.trim(), v.regex(RE_NAME));

export const Fullname = v.pipe(v.string(), v.trim(), v.regex(RE_FULLNAME));

export const Username = v.pipe(v.string(), v.trim(), v.regex(RE_USERNAME));

export const Surname = v.pipe(v.string(), v.trim(), v.regex(RE_SURNAME));

export const PhoneNumber = v.pipe(v.string(), v.trim(), v.regex(RE_PHONENUMBER));
