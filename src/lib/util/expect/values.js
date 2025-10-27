import * as v from 'valibot';

/** Value/constraint validators */

/**
 * Expect a value not to be null
 *
 * @param {any} value
 */
export function expect_notNull(value) {
	v.notValue(null, value);
}

/**
 * Expect a value to be a boolean and true
 *
 * @param {any} value
 */
export function expect_true(value) {
	v.value(true, value);
}

export { expect_true as true };

/**
 * Expect a positive number (greater than zero)
 *
 * @param {any} value
 */
export function expect_positiveNumber(value) {
	const schema = v.pipe(
		v.number(),
		v.custom((val) => val > 0, 'Invalid value: Expected number > 0')
	);
	v.parse(schema, value);
}

/**
 * Throws a validation error if value is not a string
 *
 * @param {any} value
 */
export function expect_notEmptyString(value) {
	const schema = v.pipe(v.string(), v.minLength(1));

	v.parse(schema, value);
}

export { expect_notNull as notNull };
export { expect_positiveNumber as positiveNumber };
export { expect_notEmptyString as notEmptyString };