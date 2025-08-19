/** Internals */

//
// @see https://developer.mozilla.org/
//    en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncFunction
//
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const objectToString = Object.prototype.toString;

/** Exports */

/**
 * Check if a value looks like an array
 *
 * @param {any} item - Item to check
 *
 * @return {boolean} true if the value looks like an array
 */
export function arrayLike(item) {
	if (!(item instanceof Object)) {
		return false;
	}

	if ('length' in item) {
		return true;
	}

	return false;
}

/**
 * Check if a value is an Arguments object
 *
 * @param {any} value
 *
 * @returns {boolean} true if the value is an Arguments object
 */
function argumentsCheck(value) {
	return objectToString.call(value) === '[object Arguments]';
}
export { argumentsCheck as arguments };

/**
 * Check if a value is an array that only contains primitives
 * - A primitive is a not-object value
 *
 * @param {any} value - value to check
 *
 * @return {boolean} true if the value is an array of primitives
 */
export function arrayOfPrimitives(value) {
	if (!Array.isArray(value)) {
		return false;
	}

	for (let j = 0, n = value.length; j < n; j = j + 1) {
		if (value[j] instanceof Object) {
			// current value is not a primitive
			return false;
		}
	}

	return true;
}

/**
 * Check if the supplied value is async iterable
 * - Aync iterable objects must implement the "@@asyncIterator" method
 *
 * @param {any} value
 *
 * @returns {boolean} true if the value is async iterable
 */
export function asyncIterator(value) {
	if (
		!(value instanceof Object) ||
		typeof value[Symbol.asyncIterator] !== 'function'
	) {
		return false;
	}

	return true;
}

/**
 * Check if the supplied value is an async function
 * - Returns true for functions declared as "async function" or
 *   async () => {}
 *
 * @warning this function does not return [true] for (sync) functions that
 *   return a promise.
 *
 * @param {any} value
 *
 * @returns {boolean} true if the value is an async function
 */
export function asyncFunction(value) {
	if (value instanceof AsyncFunction) {
		return true;
	}

	return false;
}

/**
 * Check if the supplied value is iterable
 * - Iterable objects must implement the "@@iterator" method
 * - Generators are also iterable
 *
 * @param {any} value
 *
 * @returns {boolean} true if the value is (not async) iterable
 */
export function iterable(value) {
	if (
		!(value instanceof Object) ||
		typeof value[Symbol.iterator] !== 'function'
	) {
		return false;
	}

	return true;
}

/**
 * Check if the supplied value is an object bu not a promise
 * - Promises return false
 * - Arrays return true
 *
 * @param {any} value
 *
 * @returns {value is object}
 *   True if the value is an Object, but not a Promise
 */
export function object(value) {
	if (!(value instanceof Object)) {
		if (value && typeof value === 'object') {
			// e.g. obj = Object.create(null);
			return true;
		}

		return false;
	} else if (value instanceof Promise) {
		return false;
	}

	return true;
}

export { ErrorEvent, PromiseRejectionEvent } from './events.js';
