export { rethrow } from './exceptions/index.js';

import * as originalValibot from 'valibot';

// Create a modified version of valibot with wrapped parse methods
const v = { ...originalValibot };

// Preserve original methods
v._parse = v.parse;
v._safeParse = v.safeParse;

// Replace with wrappers for better stack trace detection
v.parse = function valibotParseWrapper(schema, input, config) {
  return v._parse(schema, input, config);
};

v.safeParse = function valibotSafeParseWrapper(schema, input, config) {
  return v._safeParse(schema, input, config);
};

export { v };
export * as expect from './expect/index.js';
export * as is from './is/index.js';
export * as object from './object/index.js';

export * as singleton from './singleton/index.js';
