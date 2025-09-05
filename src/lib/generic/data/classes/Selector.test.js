import { describe, it, expect } from 'vitest';

import Selector from './Selector.js';

describe('Selector Constructor Cases', () => {
	const testItems = [
		{ name: 'maria', age: 25, active: true },
		{ name: 'john', age: 30, active: false },
		{ name: 'alice', age: 25, active: true }
	];

	describe('Case A: null selector', () => {
		it('should match all items when selector is null', () => {
			const selector = new Selector(null);
			
			expect(selector.findAll(testItems)).toHaveLength(3);
			expect(selector.findFirst(testItems)).toBe(testItems[0]);
		});
	});

	describe('Case B: empty object selector', () => {
		it('should match all items when selector is empty object', () => {
			const selector = new Selector({});
			
			expect(selector.findAll(testItems)).toHaveLength(3);
			expect(selector.findFirst(testItems)).toBe(testItems[0]);
		});
	});

	describe('Case C: single key-value pair selector', () => {
		it('should match items with single property', () => {
			const selector = new Selector({ name: 'john' });
			
			const results = selector.findAll(testItems);
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('john');
			
			expect(selector.findFirst(testItems)?.name).toBe('john');
		});

		it('should match multiple items with same property value', () => {
			const selector = new Selector({ age: 25 });
			
			const results = selector.findAll(testItems);
			expect(results).toHaveLength(2);
			expect(results.every(item => item.age === 25)).toBe(true);
		});

		it('should return empty results when no match found', () => {
			const selector = new Selector({ name: 'nonexistent' });
			
			expect(selector.findAll(testItems)).toHaveLength(0);
			expect(selector.findFirst(testItems)).toBe(null);
		});
	});

	describe('Case D: multiple key-value pairs selector', () => {
		it('should match items with all specified properties', () => {
			const selector = new Selector({ age: 25, active: true });
			
			const results = selector.findAll(testItems);
			expect(results).toHaveLength(2);
			expect(results.every(item => item.age === 25 && item.active === true)).toBe(true);
		});

		it('should not match items missing any property', () => {
			const selector = new Selector({ name: 'john', active: true });
			
			const results = selector.findAll(testItems);
			expect(results).toHaveLength(0);
		});

		it('should match exact combination', () => {
			const selector = new Selector({ name: 'john', age: 30, active: false });
			
			const results = selector.findAll(testItems);
			expect(results).toHaveLength(1);
			expect(results[0]).toBe(testItems[1]);
		});
	});
});

describe('Selector Edge Cases', () => {
	describe('null/undefined inputs', () => {
		it('should handle null items array', () => {
			const selector = new Selector({ name: 'john' });
			
			expect(selector.findFirst(null)).toBe(null);
			expect(selector.findAll(null)).toEqual([]);
		});

		it('should handle undefined items array', () => {
			const selector = new Selector({ name: 'john' });
			
			expect(selector.findFirst(undefined)).toBe(null);
			expect(selector.findAll(undefined)).toEqual([]);
		});

		it('should handle empty items array', () => {
			const selector = new Selector({ name: 'john' });
			
			expect(selector.findFirst([])).toBe(null);
			expect(selector.findAll([])).toEqual([]);
		});
	});

	describe('property value types', () => {
		const mixedItems = [
			{ id: 1, name: 'first', flag: true },
			{ id: '1', name: 'second', flag: false },
			{ id: 0, name: 'third', flag: null },
			{ id: undefined, name: 'fourth', flag: undefined }
		];

		it('should match numeric values exactly', () => {
			const selector = new Selector({ id: 1 });
			const results = selector.findAll(mixedItems);
			
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('first');
		});

		it('should distinguish between number and string', () => {
			const selectorNum = new Selector({ id: 1 });
			const selectorStr = new Selector({ id: '1' });
			
			expect(selectorNum.findFirst(mixedItems)?.name).toBe('first');
			expect(selectorStr.findFirst(mixedItems)?.name).toBe('second');
		});

		it('should match boolean values exactly', () => {
			const selectorTrue = new Selector({ flag: true });
			const selectorFalse = new Selector({ flag: false });
			
			expect(selectorTrue.findFirst(mixedItems)?.name).toBe('first');
			expect(selectorFalse.findFirst(mixedItems)?.name).toBe('second');
		});

		it('should match null values', () => {
			const selector = new Selector({ flag: null });
			const results = selector.findAll(mixedItems);
			
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('third');
		});

		it('should match undefined values', () => {
			const selector = new Selector({ id: undefined });
			const results = selector.findAll(mixedItems);
			
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('fourth');
		});
	});

	describe('missing properties', () => {
		const itemsWithMissingProps = [
			{ name: 'complete', age: 25, active: true },
			{ name: 'missing-age', active: false },
			{ name: 'missing-active', age: 30 },
			{ age: 35, active: true }
		];

		it('should match items where property is undefined or missing', () => {
			const selector = new Selector({ age: undefined });
			const results = selector.findAll(itemsWithMissingProps);
			
			// Missing properties return undefined, so they match undefined selector
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('missing-age');
		});

		it('should handle items with missing properties in multi-key selector', () => {
			const selector = new Selector({ name: 'complete', age: 25 });
			const results = selector.findAll(itemsWithMissingProps);
			
			expect(results).toHaveLength(1);
			expect(results[0].name).toBe('complete');
		});
	});
});

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

	it('should return first matching item when multiple matches exist', () => {
		const arr = [
			{ type: 'user', name: 'first' },
			{ type: 'admin', name: 'second' },
			{ type: 'user', name: 'third' }
		];

		const selector = new Selector({ type: 'user' });
		const result = selector.findFirst(arr);

		expect(result?.name).toBe('first');
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

	it('should return array with all matching items', () => {
		const arr = [
			{ category: 'A', value: 1 },
			{ category: 'B', value: 2 },
			{ category: 'A', value: 3 },
			{ category: 'A', value: 4 }
		];

		const selector = new Selector({ category: 'A' });
		const results = selector.findAll(arr);

		expect(results).toHaveLength(3);
		expect(results.every(item => item.category === 'A')).toBe(true);
		expect(results.map(item => item.value).sort()).toEqual([1, 3, 4]);
	});
});
