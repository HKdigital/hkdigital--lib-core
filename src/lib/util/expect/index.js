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

/** Reusable schema's */

// const StringSchema = v.string();
// const FunctionSchema = v.function();

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

// boolean
// number
// symbol
// defined

// > Base objects

// object
/**
 * Throws a validation error if value is not an object
 *
 * @param {*} value
 */
function object_(value) {
	v.parse(v.looseObject({}), value);
}

export { object_ as object };

// array

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

// promise
// map
// set
// error

// > Common values

// notNull

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

// store

// notEmptyArray
// arrayLike
// ArrayBuffer
// ArrayOfStrings
// arrayOrUndefined
// arangoCollectionId
// uriComponent
// objectNoArray
// objectNoFunction

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
// arrayOrSet
// setOfStrings
// emptyStringOrSymbol
