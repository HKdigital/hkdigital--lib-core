import * as expect from '$lib/util/expect.js';

import { toArrayPath } from '$lib/util/array/index.js';

import { objectGet, PATH_SEPARATOR } from '../object.js';

export const RE_JS_EXPRESSION = /\$\{([^${}]*)\}/g;
export const RE_MUSTACHE = /\{\{([^{}]*)\}\}/g;

/**
 * Interpolate: substitute variables in a string
 *
 * - Uses mustache template style expression substitution:
 *   Variables and expressions are surrounded by {{...}}
 *
 *  TODO: full mustache support, see https://github.com/janl/mustache.js
 *
 * --
 *
 * @eg const template = `Hello {{name}}`;
 *
 * --
 *
 * @param {string} template - Template string to interpolate
 * @param {object} templateData - Template data to use for interpolation
 *
 * @returns {string} interpolated string
 */
export function interpolate(
  template,
  templateData,
  expressionRegexp = RE_MUSTACHE
) {
  expect.string(template);

  expect.object(templateData);

  return template.replace(
    expressionRegexp,

    (match, expression) => {
      const path = toArrayPath(expression);

      /** @type {string} */
      const replacement = objectGet(templateData, path, undefined);

      if (
        typeof replacement !== 'string' &&
        typeof replacement !== 'number' &&
        typeof replacement !== 'boolean'
      ) {
        throw new Error(
          'Failed to interpolate template: Missing or invalid value for ' +
            `expression [${expression}] (expected string, number or boolean)`
        );
      }

      return replacement;
    }
  );
}
