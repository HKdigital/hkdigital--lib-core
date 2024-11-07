import { describe, it, expect } from 'vitest';

import { findFirst, findAll, pushNotEmpty } from './index.js';

describe('findFirst', () => {
	it('should find an item in an array by key-value', () => {
		// > Data

		const arr = [{ name: 'maria' }, { name: 'john' }];

		// > Positive test

		expect(findFirst(arr, { name: 'john' })?.name).toBe('john');

		// > Negative test

		expect(findFirst(arr, { name: 'foo' })).toBe(null);
	});
});

describe('findAll', () => {
	it('should find items in an array by key-value', () => {
		// > Data

		const arr = [
			{ name: 'maria', age: 9 },
			{ name: 'john', age: 10 },
			{ name: 'john', age: 11 }
		];

		// > Positive test

		expect(findAll(arr, { name: 'john' }).length).toBe(2);

		// > Negative test

		expect(findAll(arr, { name: 'foo' }).length).toBe(0);
	});
});

describe('pushNotEmpty', () => {
	it('should push not empty value to an array', () => {
		// > Positive test

		expect(pushNotEmpty([], 1)).toEqual([1]);
		expect(pushNotEmpty([1], 2)).toEqual([1, 2]);
		expect(pushNotEmpty(['one'], 'two')).toEqual(['one', 'two']);
		expect(pushNotEmpty([], false)).toEqual([false]);

		// > Negative test

		expect(pushNotEmpty([], '')).toEqual([]);
		expect(pushNotEmpty([], null)).toEqual([]);
		expect(pushNotEmpty([], undefined)).toEqual([]);
	});
});
