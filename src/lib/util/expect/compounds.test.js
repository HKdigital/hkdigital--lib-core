import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

describe('expect.store', () => {
	it('should test if value is a store', () => {
		// > Positive test

		const store = {
			subscribe: () => {}
		};

		expect_.store(store);

		// > Negative test

		try {
			expect_.store({ subscribe: null });
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected unknown but received Object');
		}
	});
});

describe('expect.arrayOrSet', () => {
	it('should test if the value is an array or a set', () => {
		// > Positive test

		expect_.arrayOrSet([]);
		expect_.arrayOrSet(new Set());

		// > Negative test

		try {
			expect_.arrayOrSet({});
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected (Array | Set) but received Object');
		}
	});
});

// TODO: iterable