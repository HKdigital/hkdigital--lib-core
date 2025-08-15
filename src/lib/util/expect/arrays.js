import * as v from 'valibot';

/**
 * Throws a validation error if value is not an array
 *
 * @param {any} value
 */
export function expect_array(value) {
	v.parse(v.instance(Array), value);
}

export { expect_array as array };

/**
 * Throws a validation error if value is not an array of strings
 *
 * @param {any} value
 */
export function expect_stringArray(value) {
	v.parse(v.array(v.string()), value);
}

export { expect_stringArray as stringArray };

/**
 * Throws a validation error if value is not an array of objects
 *
 * @param {any} value
 */
export function expect_objectArray(value) {
	v.parse(v.array(v.looseObject({})), value);
}

export { expect_objectArray as objectArray };

/**
 * Throws an exception if the value is not an Array or the array is empty
 */
export function expect_notEmptyArray(value) {
	v.parse(v.pipe(v.instance(Array), v.nonEmpty()), value);
}

export { expect_notEmptyArray as notEmptyArray };

/**
 * Throws a validation error if value is not array like
 * - Checks if the value is an object and has a property `length`
 *
 * @param {any} value
 */
export function expect_arrayLike(value) {
	v.parse(v.object({ length: v.number() }), value);
}

export { expect_arrayLike as arrayLike };

// arrayOrSet moved to compounds.js
