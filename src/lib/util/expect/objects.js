import * as v from 'valibot';
import * as is from '../is.js';

/** Internals */

const ObjectSchema = v.custom(is.object, `Invalid type: Expected object`);

/** Object-related validators */

/**
 * Throws a validation error if value is not an object
 *
 * @param {any} value
 */
function expect_object(value) {
	v.parse(ObjectSchema, value);
}

export { expect_object as object };

/**
 * Throws a validation error if value is not an object or the value
 * is an array
 *
 * @param {any} value
 */
export function expect_objectNoArray(value) {
	v.parse(
		v.custom((value) => {
			if (!is.object(value) || value instanceof Array) {
				return false;
			}

			return true;
		}),
		value
	);
}

/**
 * Throws a validation error if value is not an object or the value
 * is a function
 *
 * @param {any} value
 */
export function expect_objectNoFunction(value) {
	v.parse(
		v.custom((value) => {
			if (!is.object(value) || typeof value === 'function') {
				return false;
			}

			return true;
		}),
		value
	);
}

/**
 * Throws a validation error if value is not an object or null
 *
 * @param {any} value
 */
export function expect_objectOrNull(value) {
	v.parse(v.union([v.literal(null), v.looseObject({})]), value);
}

export { expect_objectNoArray as objectNoArray };
export { expect_objectNoFunction as objectNoFunction };
export { expect_objectOrNull as objectOrNull };