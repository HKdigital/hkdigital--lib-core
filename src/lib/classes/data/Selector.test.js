import { describe, it, expect } from 'vitest';

import Selector from './Selector.js';

describe('Selector.findFirst', () => {
	it('should find an item in an array by key-value', () => {
		// > Data

		const arr = [{ name: 'maria' }, { name: 'john' }];

		// > Positive test

		const select1 = new Selector({ name: 'john' });

		expect(select1.findFirst(arr)?.name).toBe('john');

		// > Negative test

		const select2 = new Selector({ name: 'foo' });

		expect(select2.findFirst(arr)).toBe(null);
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

		const select1 = new Selector({ name: 'john' });

		expect(select1.findAll(arr).length).toBe(2);

		// > Negative test

		const select2 = new Selector({ name: 'foo' });

		expect(select2.findAll(arr).length).toBe(0);
	});
});
