import * as v from 'valibot';
import * as is from '../is/index.js';

/** Compound validators - combinations and unions of basic validators */

/**
 * Throws a validation error if value is not iterable
 *
 * @param {any} value
 */
export function expect_iterable(value) {
	const schema = v.pipe(v.looseObject({ [Symbol.iterator]: v.function() }));

	v.parse(schema, value);
}

export { expect_iterable as iterable };

/**
 * Throws a validation error if value is not a store (has no subscribe method)
 *
 * @param {any} value
 */
export function expect_store(value) {
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

export { expect_store as store };

/**
 * Throws a validation error if value is not an array or Set
 *
 * @param {any} value
 */
export function expect_arrayOrSet(value) {
	v.parse(v.union([v.instance(Array), v.instance(Set)]), value);
}

export { expect_arrayOrSet as arrayOrSet };