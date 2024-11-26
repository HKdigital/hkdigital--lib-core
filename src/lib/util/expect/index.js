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

import { isObject } from '../is/index.js';

/** Internals */

const ObjectSchema = v.custom(isObject, `Invalid type: Expected object`);

/** Exports */

// > Primitives

/**
 * Throws a validation error if value is not a string
 *
 * @param {*} value
 */
export function string(value) {
	v.parse(v.string(), value);
}

/**
 * Throws a validation error if value is not a boolean
 *
 * @param {*} value
 */
export function boolean(value) {
	v.parse(v.boolean(), value);
}

/**
 * Throws a validation error if value is not a number
 *
 * @param {*} value
 */
export function number(value) {
	v.parse(v.number(), value);
}

/**
 * Throws a validation error if value is not a Symbol
 *
 * @param {*} value
 */
export function symbol(value) {
	v.parse(v.symbol(), value);
}

/**
 * Throws a validation error if value is undefined
 *
 * @param {*} value
 */
function undefined_(value) {
	v.parse(v.undefined(), value);
}

export { undefined_ as undefined };

// > Base objects

/**
 * Throws a validation error if value is not an object
 *
 * @param {*} value
 */
function object_(value) {
	v.parse(ObjectSchema, value);
	// v.parse(v.looseObject({}), value);
}

export { object_ as object };

/**
 * Throws a validation error if value is not an array
 *
 * @param {*} value
 */
function array_(value) {
	v.parse(v.instance(Array), value);
}

export { array_ as array };

/**
 * Throws a validation error if value is not an array of strings
 *
 * @param {*} value
 */
export function stringArray(value) {
	v.parse(v.array(v.string()), value);
}

/**
 * Throws a validation error if value is not an array of objects
 *
 * @param {*} value
 */
export function objectArray(value) {
	v.parse(v.array(v.looseObject({})), value);
}

/**
 * Throws a validation error if value is not a function
 *
 * @param {*} value
 */
function _function(value) {
	v.parse(v.function(), value);
}

export { _function as function };

export { _function as class };

/**
 * Throws a validation error if value is not a Promise
 *
 * @param {*} value
 */
export function promise_(value) {
	v.parse(v.instance(Promise), value);
}

export { promise_ as promise };

/**
 * Throws a validation error if value is not a Map
 *
 * @param {*} value
 */
export function map_(value) {
	v.parse(v.instance(Map), value);
}

export { map_ as map };

/**
 * Throws a validation error if value is not a Set
 *
 * @param {*} value
 */
export function set_(value) {
	v.parse(v.instance(Set), value);
}

export { set_ as set };

/**
 * Throws a validation error if value is not an Error instance
 *
 * @param {*} value
 */
export function error_(value) {
	v.parse(v.instance(Map), value);
}

export { error_ as error };

// > Common values

/**
 * Expect a value not to be null
 *
 * @param {*} value
 */
export function notNull(value) {
	v.notValue(null, value);
}

/**
 * Expect a value to be a boolean and true
 *
 * @param {*} value
 */
export function _true(value) {
	v.value(true, value);
}

export { _true as true };

// > Compounds

// positiveNumber
// notNegativeNumber
// positiveInteger
// notNegativeInteger

// stringOrNull
// stringOrUndefined

/**
 * Throws a validation error if value is not a string
 *
 * @param {*} value
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
 * @param {*} value
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
 * @param {*} value
 */
export function store(value) {
	v.parse(
		v.custom((value) => {
			if (!isObject(value) || typeof value.subscribe !== 'function') {
				return false;
			}

			return true;
		}),
		value
	);
}

// notEmptyArray
// arrayLike
/**
 * Throws a validation error if value is not array like
 * - Checks if the value is an object and has a property `length`
 *
 * @param {*} value
 */
export function arrayLike(value) {
	v.parse(v.object({ length: v.number() }), value);
}

// ArrayBuffer
// arrayOrUndefined
// arangoCollectionId
// uriComponent

/**
 * Throws a validation error if value is not an object or the value
 * is an array
 *
 * @param {*} value
 */
export function objectNoArray(value) {
	v.parse(
		v.custom((value) => {
			if (!isObject(value) || value instanceof Array) {
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
 * @param {*} value
 */
export function objectNoFunction(value) {
	v.parse(
		v.custom((value) => {
			if (!isObject(value) || typeof value === 'function') {
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
 * @param {*} value
 */
export function objectOrNull(value) {
	v.parse(v.union([v.value(null), v.looseObject({})]), value);
}

// objectOrUndefined
// objectPath

/**
 * Throws a validation error if value is not an array or Set
 *
 * @param {*} value
 */
export function arrayOrSet(value) {
	v.parse(v.union([v.instance(Array), v.instance(Set)]), value);
}

// setOfStrings
// emptyStringOrSymbol
