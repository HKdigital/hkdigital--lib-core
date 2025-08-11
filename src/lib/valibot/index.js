import * as valibot from 'valibot';

// export * from './date.js';

export * from './parsers.js';

/**
 * Custom parse function that wraps valibot's original parse
 * for better stack trace detection in error logging
 */
function valibotParser(schema, input, config) {
  return valibot.parse(schema, input, config);
}

// Create a new object that inherits from valibot but overrides parse
const v = Object.create(valibot);

// Use defineProperty to explicitly set our properties
Object.defineProperty(v, 'originalParse', {
  value: valibot.parse,
  writable: true,
  enumerable: false,
  configurable: true
});

Object.defineProperty(v, 'parse', {
  value: valibotParser,
  writable: true,
  enumerable: true,
  configurable: true
});

export { v };
export default valibot;
