import { describe, it, expect } from 'vitest';

import * as expect_ from '../expect.js';

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

describe('expect.true', () => {
	it('should test that the value is true', () => {
		// > Positive test

		expect_.true(true);

		// > Negative test

		try {
			expect_.true(false);
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected true but received false');
		}

		try {
			expect_.true(1);
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected true but received 1');
		}

		try {
			expect_.true('true');
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected true but received "true"');
		}

		try {
			expect_.true(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid value: Expected true but received null');
		}
	});
});

describe('expect.positiveNumber', () => {
	it('should test that the value is a positive number (> 0)', () => {
		// > Positive tests

		expect_.positiveNumber(1);
		expect_.positiveNumber(10);
		expect_.positiveNumber(0.1);
		expect_.positiveNumber(1000000);
		expect_.positiveNumber(Number.MAX_SAFE_INTEGER);

		// > Negative tests

		// Zero should not be accepted (not positive)
		try {
			expect_.positiveNumber(0);
		} catch (e) {
			expect(e.message).toContain('Invalid value: Expected number > 0');
		}

		// Negative numbers should not be accepted
		try {
			expect_.positiveNumber(-1);
		} catch (e) {
			expect(e.message).toContain('Invalid value: Expected number > 0');
		}

		try {
			expect_.positiveNumber(-100);
		} catch (e) {
			expect(e.message).toContain('Invalid value: Expected number > 0');
		}

		// Non-number types should not be accepted
		try {
			expect_.positiveNumber('1');
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected number but received "1"');
		}

		try {
			expect_.positiveNumber(null);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected number but received null');
		}

		try {
			expect_.positiveNumber(undefined);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected number but received undefined');
		}

		try {
			expect_.positiveNumber(true);
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected number but received true');
		}

		// NaN should not be accepted
		try {
			expect_.positiveNumber(NaN);
		} catch (e) {
			expect(e.message).toContain('Invalid type');
		}
	});
});