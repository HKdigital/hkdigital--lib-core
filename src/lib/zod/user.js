// > Imports

import { z } from 'zod';

import { RE_FULLNAME, RE_NAME, RE_USERNAME } from '../constants/regexp/index.js';

// > Exports

export const Name = z.string().trim().regex(RE_NAME);
/** @typedef { z.infer<typeof Name> } Name */

export const Fullname = z.string().trim().regex(RE_FULLNAME);
/** @typedef { z.infer<typeof Fullname> } Fullname */

export const Username = z.string().trim().regex(RE_USERNAME);
/** @typedef { z.infer<typeof Username> } Username */
