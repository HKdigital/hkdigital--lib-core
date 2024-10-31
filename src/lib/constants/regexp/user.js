/**
 * User related regexps
 *
 * Inspired by
 * @see https://ihateregex.io/expr/username/
 * @see https://ihateregex.io/expr/discord-username/
 */

import { NUMBER as N, CHAR, CHAR_NUMBER as CN } from './text.js';

export const RE_NAME = new RegExp(
  `^[${CHAR}]+(([\\s'\\-\\.]{1}|[\\s]{1}[']{0,1})[${CHAR}]+){0,8}$`, 'v'
);

export const RE_FULLNAME = new RegExp(
  `^[${CHAR}]{2,}[\\s][']?[${CHAR}]{1,}([\\s]?['\\-]?[${CHAR}]{1,})*$`, 'v'
);

export const RE_SURNAME = new RegExp(
  `^[']?[${CHAR}]{1,}([\\s]?['\\-]?[${CHAR}]{1,})*$`, 'v'
)

export const RE_USERNAME = new RegExp(
  `^[${CN}]{2,40}([\\-_\\.][${CN}]{1,40}){0,3}([#][${N}]{1,10}){0,1}$`, 'v'
);

export const RE_EMAIL = new RegExp(
  `[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+`, 'v'
);

export const RE_PHONENUMBER = new RegExp(
  `^[\\+]?[\\(]?[0-9]{3}[\\)]?[\\-\\s\\.]?[0-9]{3}[\\-\\s\\.]?[0-9]{4,6}$`, 'v'
)