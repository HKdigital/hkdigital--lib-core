import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

describe('expect.string', () => {
	it('should test if a value is a string', () => {
		// > Positive test

		expect_.string('hello');

		// > Negative test

		try {
			expect_.string(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}
	});
});

describe('expect.boolean', () => {
	it('should test if a value is a boolean', () => {
		// > Positive test

		expect_.boolean(true);
		expect_.boolean(false);

		// > Negative test

		try {
			expect_.boolean(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected boolean but received 123');
		}
	});
});

describe('expect.number', () => {
	it('should test if a value is a number', () => {
		// > Positive test

		expect_.number(123);
		expect_.number(-123);

		// > Negative test

		try {
			expect_.number('123'); // a numeric string is not a number!
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected number but received "123"');
		}
	});
});

describe('expect.symbol', () => {
	it('should test if a value is a Symbol', () => {
		// > Positive test

		expect_.symbol(Symbol());
		expect_.symbol(Symbol('test'));

		// > Negative test

		try {
			expect_.symbol(123);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected symbol but received 123');
		}
	});
});

describe('expect.defined', () => {
	it('should test if a value is defined', () => {
		// > Positive test

		expect_.defined(123);
		expect_.defined(0);
		expect_.defined(null);
		expect_.defined('');

		// > Negative test

		try {
			expect_.defined(undefined);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected any value, but received undefined');
		}
	});
});

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

// TODO: function
// TODO: promise  
// TODO: map
// TODO: error
