import * as v from 'valibot';

/**
 * Throws a validation error if value is not a string
 *
 * @param {any} value
 */
export function expect_string(value) {
	v.parse(v.string(), value);
}

export { expect_string as string };

/**
 * Throws a validation error if value is not a boolean
 *
 * @param {any} value
 */
export function expect_boolean(value) {
	v.parse(v.boolean(), value);
}

export { expect_boolean as boolean };

/**
 * Throws a validation error if value is not a number
 *
 * @param {any} value
 */
export function expect_number(value) {
	v.parse(v.number(), value);
}

export { expect_number as number };

/**
 * Throws a validation error if value is not a Symbol
 *
 * @param {any} value
 */
export function expect_symbol(value) {
	v.parse(v.symbol(), value);
}

export { expect_symbol as symbol };

/**
 * Throws a validation error if value is not defined
 *
 * @param {any} value
 */
export function expect_defined(value) {
	v.parse(
		v.custom((value) => {
			if (value === undefined) {
				return false;
			}

			return true;
		}, 'Invalid type: Expected any value, but received undefined'),
		value
	);
}

export { expect_defined as defined };
