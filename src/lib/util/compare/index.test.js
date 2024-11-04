import { describe, it, expect } from 'vitest';

import { equals } from './index.js';

describe('equals', () => {
	it('should compare primitive values', () => {
		// > Positive tests
		expect(equals(1, 1)).toBe(true);
		expect(equals(false, false)).toBe(true);
		expect(equals('hello', 'hello')).toBe(true);

		// > Negative tests
		expect(equals(1, 0)).toBe(false);
		expect(equals(true, false)).toBe(false);
		expect(equals('hello', 'world')).toBe(false);
	});

	it('should compare array and object values', () => {
		// > Positive tests
		expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
		expect(equals({ a: 1 }, { a: 1 })).toBe(true);

		// > Negative tests
		expect(equals([1, 2, 3], [1, 2, 4])).toBe(false);
		expect(equals({ a: 1 }, { b: 1 })).toBe(false);
	});
});
