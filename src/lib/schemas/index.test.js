import { describe, it, expect } from 'vitest';

import * as schemas from './index.js';

describe('schemas.ValidateUrl', () => {
	it('should be an object', () => {
		expect(schemas.ValidateUrl).toBeInstanceOf(Object);
	});
});

describe('schemas.ValidateUrlOrEmptyString', () => {
	it('should be an object', () => {
		expect(schemas.ValidateUrlOrEmptyString).toBeInstanceOf(Object);
	});
});

describe('schemas.ValidateUrlPath', () => {
	it('should be an object', () => {
		expect(schemas.ValidateUrlPath).toBeInstanceOf(Object);
	});
});

describe('schemas.ValidateRelativeUrl', () => {
	it('should be an object', () => {
		expect(schemas.ValidateRelativeUrl).toBeInstanceOf(Object);
	});
});
