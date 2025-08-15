import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

describe('expect.array', () => {
	it('should test if a value is an array', () => {
		// > Positive test

		expect_.array([]);
		expect_.array([1, 2, true]);

		// > Negative test

		try {
			expect_.array(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Array but received null');
		}
	});
});

describe('expect.stringArray', () => {
	it('should test if a value is an array of strings', () => {
		// > Positive test

		expect_.stringArray([]);
		expect_.stringArray(['one', 'two', 'three']);

		// > Negative test

		try {
			expect_.stringArray(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Array but received null');
		}
	});
});

// TODO: objectArray

// TODO: notEmptyArray

describe('expect.arrayLike', () => {
	it('should test if the value is array-like', () => {
		// > Positive test

		expect_.arrayLike([]);
		expect_.arrayLike({ length: 0 });

		// > Negative test

		try {
			expect_.arrayLike(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Object but received 123');
		}
	});
});
