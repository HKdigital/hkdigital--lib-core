import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

describe('expect.notNull', () => {
	it('should test that the value is not null', () => {
		// > Positive test

		expect_.notNull('string');

		// > Negative test

		try {
			expect_.notNull(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected a non-null value');
		}
	});
});

describe('expect.notEmptyString', () => {
	it('should test if a value is an non-empty string', () => {
		// > Positive test

		expect_.notEmptyString('valid string');
		expect_.notEmptyString('a');

		// > Negative test

		try {
			expect_.notEmptyString(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received null');
		}
	});
});

// TODO: true
// TODO: positiveNumber