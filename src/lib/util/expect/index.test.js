import { describe, it, expect } from 'vitest';

import * as expect_ from './index.js';

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

// TODO: function
// TODO: promise
// TODO: map

describe('expect.set', () => {
	it('should test if value is a Set', () => {
		// > Positive test
		const setTest = new Set();
		expect_.set(setTest);

		// > Negative test
		try {
			expect_.set(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Set but received null');
		}
	});
});

// TODO: error

describe('expect.notNull', () => {
	it('should test that the value is not null', () => {
		// > Positive test

		expect_.notNull('string');

		// > Negative test

		try {
			expect_.notNull(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected a non-null value');
		}
	});
});

// TODO: true

describe('expect.notEmptyString', () => {
	it('should test if a value is an non-empty string', () => {
		// > Positive test

		expect_.notEmptyString('valid string');
		expect_.notEmptyString('a');

		// > Negative test

		try {
			expect_.notEmptyString(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received null');
		}
	});
});

// TODO: iterable

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
