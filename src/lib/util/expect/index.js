/**
 * Validation functions that can be used as safe guards in your code
 *
 * @example
 *
 * import * as expect from '<path>/expect.js';
 *
 * function logText( text )
 * {
 *   expect.string( text );
 *   expect.true( 1 > 0 );
 *
 *   console.log( text );
 * }
 *
 * logText( 'Hello' );
 * logText( 123 );      // <- Will throw an exception
 */

import * as v from 'valibot';

import * as is from '../is/index.js';

/** Internals */

const ObjectSchema = v.custom(is.object, `Invalid type: Expected object`);

/** Exports */

export * from './arrays.js';
export * from './primitives.js';
export * from './url.js';

// > Base objects

/**
 * Throws a validation error if value is not an object
 *
 * @param {any} value
 */
function object_(value) {
	v.parse(ObjectSchema, value);
	// v.parse(v.looseObject({}), value);
}

export { object_ as object };

/**
 * Throws a validation error if value is not a function
 *
 * @param {any} value
 */
function function_(value) {
	v.parse(v.function(), value);
}

export { function_ as function };

export { function_ as class };

/**
 * Throws a validation error if value is not a Promise
 *
 * @param {any} value
 */
function promise_(value) {
	v.parse(v.instance(Promise), value);
}

export { promise_ as promise };

/**
 * Throws a validation error if value is not a Map
 *
 * @param {any} value
 */
function map_(value) {
	v.parse(v.instance(Map), value);
}

export { map_ as map };

/**
 * Throws a validation error if value is not a Set
 *
 * @param {any} value
 */
function set_(value) {
	v.parse(v.instance(Set), value);
}

export { set_ as set };

/**
 * Throws a validation error if value is not an Error instance
 *
 * @param {any} value
 */
export function error_(value) {
	v.parse(v.instance(Map), value);
}

export { error_ as error };

// > Common values

/**
 * Expect a value not to be null
 *
 * @param {any} value
 */
export function notNull(value) {
	v.notValue(null, value);
}

/**
 * Expect a value to be a boolean and true
 *
 * @param {any} value
 */
export function _true(value) {
	v.value(true, value);
}

export { _true as true };

// > Compounds

/**
 * Expect a positive number
 *
 * @param {any} value
 */
export function positiveNumber(value) {
	const schema = v.pipe(v.number(), v.minValue(0));
	v.parse(schema, value);
}

// notNegativeNumber
// positiveInteger
// notNegativeInteger

// stringOrNull
// stringOrUndefined

/**
 * Throws a validation error if value is not a string
 *
 * @param {any} value
 */
export function notEmptyString(value) {
	const schema = v.pipe(v.string(), v.minLength(1));

	v.parse(schema, value);
}

// notEmptyStringOrNull

// asyncIterator
// iterable

/**
 * Throws a validation error if value is not iterable
 *
 * @param {any} value
 */
export function iterable(value) {
	const schema = v.pipe(v.looseObject({ [Symbol.iterator]: v.function() }));

	v.parse(schema, value);
}

// iterator

/**
 * Throws a validation error if value is not a a store (has not subscribe
 * method)
 *
 * @param {any} value
 */
export function store(value) {
	v.parse(
		v.custom((value) => {
			if (!is.object(value) || typeof value?.subscribe !== 'function') {
				return false;
			}

			return true;
		}),
		value
	);
}

// ArrayBuffer
// arrayOrUndefined
// arangoCollectionId
// uriComponent

/**
 * Throws a validation error if value is not an object or the value
 * is an array
 *
 * @param {any} value
 */
export function objectNoArray(value) {
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
export function objectNoFunction(value) {
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
export function objectOrNull(value) {
	v.parse(v.union([v.literal(null), v.looseObject({})]), value);
}

// objectOrUndefined
// objectPath

/**
 * Throws a validation error if value is not an array or Set
 *
 * @param {any} value
 */
export function arrayOrSet(value) {
	v.parse(v.union([v.instance(Array), v.instance(Set)]), value);
}

// setOfStrings
// emptyStringOrSymbol
