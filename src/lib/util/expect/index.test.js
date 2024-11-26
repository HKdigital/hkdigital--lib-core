import { describe, it, expect } from 'vitest';

import * as expect_ from './index.js';

import * as v from 'valibot';

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

describe('expect.undefined', () => {
	it('should test if a value is undefined', () => {
		// > Positive test

		expect_.undefined(undefined);

		// > Negative test

		try {
			expect_.undefined(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected undefined but received null');
		}
	});
});

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

describe('expect.array', () => {
	it('should test if a value is an array', () => {
		// > Positive test

		expect_.array([]);
		expect_.array([1, 2, true]);

		// > Negative test

		try {
			expect_.array(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Array but received null');
		}
	});
});

describe('expect.stringArray', () => {
	it('should test if a value is an array of strings', () => {
		// > Positive test

		expect_.stringArray([]);
		expect_.stringArray(['one', 'two', 'three']);

		// > Negative test

		try {
			expect_.stringArray(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected Array but received null');
		}
	});
});
