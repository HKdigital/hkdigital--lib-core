/* ------------------------------------------------------------------ Imports */

import * as expect from '$lib/util/expect/index.js';

import { PATH_SEPARATOR } from '$lib/util/object/index.js';

/* ------------------------------------------------------------------ Typedef */

/* ------------------------------------------------------------------ Exports */

export default class IterableTree {
	#options;

	/**
	 * Construct an object that can be used to iterate paths and values in
	 * an object.
	 * - Returns path-value pairs for all leaves of the object (tree)
	 * - Iterates "own properties" only (not inherited properties)
	 *
	 * @param {object} obj - Object to iterate
	 * @param {import('./typedef.js').IterableTreeOptions} [options]
	 * @param {string[]} [_parentArrPath]
	 */
	constructor(obj, options, _parentArrPath) {
		//super( ...arguments );

		expect.object(obj);

		this.obj = obj;

		this.#options = Object.assign(
			{
				walkArrays: false,
				ignoreEmptyObjectLeaves: false,
				expandPathKeys: false,
				outputIntermediateNodes: false
			},
			options
		);

		this._parentArrPath = _parentArrPath || null;
	}

	/* --------------------------------------------------------- Public methods */

	// -------------------------------------------------------------------- Method

	/**
	 * Get an iterator to iterate over all object [ path, value ] entries
	 *
	 * @returns {Iterable<[string[], any]>} iterable that yields [path, value] pairs
	 */
	*entries() {
		const obj = this.obj;
		const parentArrPath = this._parentArrPath;

		const options = this.#options;

		let { expandPathKeys, ignoreEmptyObjectLeaves, outputIntermediateNodes } =
			this.#options;

		if (parentArrPath) {
			// Never expand keys if not in root object
			expandPathKeys = false;
		}

		// @note keys are own properties only
		const keys = Object.keys(obj);

		let pathKeys;

		if (expandPathKeys) {
			pathKeys = [];
		}

		// -- STEP 1: Normal object iteration (and gather path keys)

		for (let j = 0, n = keys.length; j < n; j = j + 1) {
			const key = keys[j];

			if (expandPathKeys && key.includes(PATH_SEPARATOR)) {
				// Gather pathKeys
				pathKeys.push(key);
				continue;
			}

			const valueAtPath = obj[key];

			if (undefined === valueAtPath) {
				// Ignore path-value pair if valueAtPath is undefined
				continue;
			}

			let path;

			if (parentArrPath) {
				path = parentArrPath.slice(0);
				path.push(key);
			} else {
				path = [key];
			}

			// No recursion >>

			if (!this.#shouldRecurse(valueAtPath)) {
				if (
					ignoreEmptyObjectLeaves &&
					valueAtPath instanceof Object &&
					0 === Object.keys(valueAtPath).length
				) {
					// Ignore empty object leave
					continue;
				}

				yield [path, valueAtPath];
				continue;
			}

			// Recursion >>

			// console.log( { path, valueAtPath, outputIntermediateNodes } );

			if (outputIntermediateNodes) {
				// outputIntermediateNodes=true
				// -> Output itermediate node

				if (Array.isArray(valueAtPath)) {
					// Intermediate node is an array
					yield [path, []];
				} else {
					// Intermediate node is plain object
					yield [path, {}];
				}
			}

			const objectIterator = new IterableTree(valueAtPath, options, path);

			for (const entry of objectIterator.entries()) {
				yield entry;
			}
		} // end for

		// -- STEP 2: Output entries from "path keys"

		if (!pathKeys || !pathKeys.length) {
			// No path keys -> done
			return;
		}

		for (let j = 0, n = pathKeys.length; j < n; j = j + 1) {
			// @note path keys do not output intermediate nodes

			const key = pathKeys[j];

			const valueAtPath = obj[key];
			const path = key.split(PATH_SEPARATOR);

			yield [path, valueAtPath];
		}
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Get an iterator to iterate over all object paths
	 *
	 * @returns {Iterable<string[]>} iterable that yields path arrays
	 */
	*paths() {
		for (const entry of this.entries()) {
			yield entry[0];
		}
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Get an iterator to iterate over all values at the leaves of the paths in
	 * the object
	 *
	 * @returns {Iterable<any>} iterable that yields leaf values
	 */
	*values() {
		for (const entry of this.entries()) {
			yield entry[1];
		}
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Make the class iterable by implementing Symbol.iterator
	 * Defaults to iterating over entries (path-value pairs)
	 *
	 * @returns {Iterable<[string[], any]>} iterable that yields [path, value] pairs
	 */
	*[Symbol.iterator]() {
		yield* this.entries();
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Returns true if the iterator should recurse into the specified value
	 *
	 * @param {any} value
	 *
	 * @return {boolean} true if the value should be iterated
	 */
	#shouldRecurse(value) {
		if (!(value instanceof Object)) {
			// not an object -> no recursion
			return false;
		}

		const walkArrays = this.#options.walkArrays;

		if (walkArrays && Array.isArray(value)) {
			// walkArrays=true AND isArray

			if (!value.length) {
				// Array is empty -> no recursion
				return false;
			}

			return true;
		}

		if ('[object Object]' !== value.toString()) {
			// Not a plain object -> no recursion
			return false;
		}

		if (Object.keys(value).length) {
			// Object is not empty -> recursion
			return true;
		}

		// Otherwise -> no recursion
		return false;
	}
} // end class
