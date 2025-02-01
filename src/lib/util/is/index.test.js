import { describe, it, expect } from 'vitest';

import { isArrayLike } from './index.js';

// > Tests

describe('isArrayLike', () => {
	it('should check if a value is array like', () => {
		// > Positive tests
		expect(isArrayLike([])).toEqual(true);
		expect(isArrayLike({ length: 0 })).toEqual(true);

		// > Negative tests
		expect(isArrayLike(123)).toEqual(false);
		expect(isArrayLike({})).toEqual(false);
	});
});

// TODO
// isArguments
// isArrayOfPrimitives
// isAsyncIterator
// isAsyncFunction
// isIterable
// isObject
