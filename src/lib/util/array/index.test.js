import { describe, it, expect } from 'vitest';

import { findFirst, findAll } from './index.js';

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

describe('Selector.findAll', () => {
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
