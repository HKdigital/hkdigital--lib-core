import * as v from 'valibot';

/**
 * Throws a validation error if value is not an array
 *
 * @param {any} value
 */
function array_(value) {
	v.parse(v.instance(Array), value);
}

export { array_ as array };

/**
 * Throws a validation error if value is not an array of strings
 *
 * @param {any} value
 */
export function stringArray(value) {
	v.parse(v.array(v.string()), value);
}

/**
 * Throws a validation error if value is not an array of objects
 *
 * @param {any} value
 */
export function objectArray(value) {
	v.parse(v.array(v.looseObject({})), value);
}

/**
 * Throws an exception if the value is not an Array or the array is empty
 */
export function notEmptyArray(value) {
	v.parse(v.pipe(v.instance(Array), v.nonEmpty()), value);
}

/**
 * Throws a validation error if value is not array like
 * - Checks if the value is an object and has a property `length`
 *
 * @param {any} value
 */
export function arrayLike(value) {
	v.parse(v.object({ length: v.number() }), value);
}
