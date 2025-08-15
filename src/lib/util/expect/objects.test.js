import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

describe('expect.object', () => {
	it('should test if a value is an object', () => {
		// > Positive test

		expect_.object({});
		expect_.object({ a: { b: 1 } });

		// > Negative test

		try {
			expect_.object(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected object');
		}
	});
});

describe('expect.objectNoArray', () => {
	it('should test that the value is an object and not an array', () => {
		// > Positive test

		expect_.objectNoArray({});

		// > Negative test

		try {
			expect_.objectNoArray([]);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected unknown but received Array');
		}
	});
});

describe('expect.objectNoFunction', () => {
	it('should test that the value is an object and not a function', () => {
		// > Positive test

		expect_.objectNoFunction({});
		expect_.objectNoFunction([]);

		// > Negative test

		try {
			expect_.objectNoFunction(() => {});
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected unknown but received Function');
		}
	});
});

// TODO: objectOrNull