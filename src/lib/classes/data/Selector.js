/**
 * Selector.js
 *
 * @description
 * This file contains a class that can be used to select items from lists of
 * objects.
 *
 * @TODO
 * Allow other selection criteria than exact key-value pair matches
 *
 * @example
 *
 *   import Selector from "./Selector.js";
 *
 *   const selector = new Selector( { age: 42 } );
 *
 *   const items =
 *     [
 *       { name: "Maria", age: 41 },
 *       { name: "John",  age: 42 },
 *       { name: "Max", age: 43 }
 *     ]
 *
 *   const item = selector.findFirst( items );
 *
 *   console.log( item );
 */

/* ------------------------------------------------------------------ Imports */

import * as expect from '../../util/expect/index.js';

/* ------------------------------------------------------------------- Export */

/**
 * Construct a Selector class
 */
export default class Selector {
	/** @type {function|null} test function */
	#testFn = null;

	/**
	 * Constructor
	 *
	 * @param {object|null} selector
	 */
	constructor(selector) {
		this.#updateTestFn(selector);
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Returns the first item from the list of items that matches the selector
	 *
	 * @template {object} T
	 * @param {T[]|null} items
	 *
	 * @returns {T|null} item or null if not found
	 */
	findFirst(items) {
		if (!items) {
			return null;
		}

		for (const item of items) {
			if (this.#testFn(item)) {
				return item;
			}
		}

		return null;
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Returns all items from the list of items that match the selector
	 *
	 * @template {object} T
	 * @param {T[]|null} items
	 *
	 * @returns {T[]|null} item or null if not found
	 */
	findAll(items) {
		const result = [];

		if (!items) {
			return result;
		}

		for (const item of items) {
			if (this.#testFn(item)) {
				result.push(item);
			}
		}

		return result;
	}

	/* ------------------------------------------------------- Internal methods */

	/**
	 * Update the internal selector function
	 */
	#updateTestFn(selector) {
		// > Case A: selector=null

		if (null === selector) {
			this.#testFn = this.#returnTrue;
			return;
		}

		// > Validate selector

		expect.objectOrNull(selector);

		const keys = Object.keys(selector);
		const n = keys.length;

		// > Case B: selector has not properties

		if (!n) {
			this.#testFn = this.#returnTrue;
			return;
		}

		// > Case C: selector with single key-value pair

		if (1 === n) {
			const key = keys[0];
			const value = selector[key];

			this.#testFn = this.#testKeyValue.bind(this, key, value);
		}

		// > Case D: selector with multiple key-value pairs

		const selectorValues = [];

		for (const key of keys) {
			selectorValues.push(selector[key]);
		}

		this.#testFn = this.#testMultipleKeyValues.bind(this, keys, selectorValues);
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Always return true
	 * - This function is used if the test function should always return true
	 *
	 * @returns {boolean} true
	 */
	#returnTrue() {
		return true;
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Return true if the item matches the key-value pair
	 * - This function is used if the test function should test a
	 *   single key-value pair
	 */
	#testKeyValue(key, value, item) {
		return value === item[key];
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Return true if the item matches all key-value pairs
	 * - This function is used if the test function should test multiple
	 *   key-value pairs
	 */
	#testMultipleKeyValues(keys, values, item) {
		let isMatch = true;

		for (let j = 0, n = keys.length; j < n; j = j + 1) {
			if (values[j] !== item[keys[j]]) {
				isMatch = false;
				break;
			}
		} // end for

		return isMatch;
	}
} // end class
