/**
 * User related regexps
 *
 * Inspired by
 * @see https://ihateregex.io/expr/username/
 * @see https://ihateregex.io/expr/discord-username/
 */

import { NUMBER as N, LCHAR, LCHAR_NUMBER as CN } from './text.js';

export const RE_NAME = new RegExp(
  `^[${LCHAR}]+(([\\s'\\-\\.]{1}|[\\s]{1}[']{0,1})[${LCHAR}]+){0,8}$`, 'v'
);

export const RE_FULLNAME = new RegExp(
  `^[${LCHAR}]{2,}[\\s][']?[${LCHAR}]{1,}([\\s]?['\\-]?[${LCHAR}]{1,})*$`, 'v'
);

export const RE_SURNAME = new RegExp(
  `^[']?[${LCHAR}]{1,}([\\s]?['\\-]?[${LCHAR}]{1,})*$`, 'v'
)

export const RE_USERNAME = new RegExp(
  `^[${CN}]{2,40}([\\-_\\.][${CN}]{1,40}){0,3}([#][${N}]{1,10}){0,1}$`, 'v'
);

export const RE_PHONENUMBER = new RegExp(
  `^[\\+]?[\\(]?[0-9]{3}[\\)]?[\\-\\s\\.]?[0-9]{3}[\\-\\s\\.]?[0-9]{4,6}$`, 'v'
)
