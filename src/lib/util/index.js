export { rethrow } from './exceptions/index.js';

import * as originalValibot from 'valibot';

// Create a modified version of valibot with wrapped parse methods

/** @type {typeof originalValibot & { _parse: any }} */
const v = { ...originalValibot, _parse: originalValibot.parse };

// Replace with wrappers for better stack trace detection
v.parse = function valibotParseWrapper(schema, input, config) {
  return this._parse(schema, input, config);
};

export { v };
export * as expect from './expect/index.js';
export * as is from './is/index.js';
export * as object from './object/index.js';

export * as singleton from './singleton/index.js';
