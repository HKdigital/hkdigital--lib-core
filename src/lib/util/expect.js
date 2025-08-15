/**
 * Validation functions that can be used as safe guards in your code
 *
 * @example
 *
 * import * as expect from 'util/expect.js';
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

export * from './expect/arrays.js';
export * from './expect/primitives.js';
export * from './expect/url.js';
export * from './expect/objects.js';
export * from './expect/values.js';
export * from './expect/compounds.js';

// TODO: Implement these validators as needed
// notNegativeNumber, positiveInteger, notNegativeInteger
// stringOrNull, stringOrUndefined, notEmptyStringOrNull
// ArrayBuffer, arrayOrUndefined, arangoCollectionId, uriComponent
// objectOrUndefined, objectPath, asyncIterator
