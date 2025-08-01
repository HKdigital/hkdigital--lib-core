import { describe, it, expect } from 'vitest';

import * as is from './index.js';

// > Tests

describe('arrayLike', () => {
	it('should check if a value is array like', () => {
		// > Positive tests
		expect(is.arrayLike([])).toEqual(true);
		expect(is.arrayLike({ length: 0 })).toEqual(true);

		// > Negative tests
		expect(is.arrayLike(123)).toEqual(false);
		expect(is.arrayLike({})).toEqual(false);
	});
});

// TODO
// isArguments
// isArrayOfPrimitives
// isAsyncIterator
// isAsyncFunction
// isIterable
// isObject
