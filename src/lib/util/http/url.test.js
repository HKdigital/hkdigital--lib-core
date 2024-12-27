import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { toURL } from './index.js';

// > Mocks

beforeEach(() => {
	global.location = { origin: 'http://test:1234' };
});

afterEach(() => {
	delete global.location;
});

// > Tests

describe('toURL', () => {
	it('should convert a string to an URL', () => {
		const urlObj = toURL('http://localhost:1234/path/to?q=test#test');

		expect(urlObj instanceof URL).toEqual(true);
		expect(urlObj.protocol).toEqual('http:');
		expect(urlObj.hostname).toEqual('localhost');
		expect(urlObj.port).toEqual('1234');
		expect(urlObj.pathname).toEqual('/path/to');
		expect(urlObj.search).toEqual('?q=test');
		expect(urlObj.hash).toEqual('#test');
	});
});

describe('toURL', () => {
	it('should return unchanged URL object', () => {
		const original = new URL('http://localhost:1234/path/to?q=test#test');

		const returned = toURL(original);

		expect(returned).toStrictEqual(original);
	});
});

describe('toURL', () => {
	it('should use the currect hostname to construct an absolute url', () => {
		const original = '/path/to?q=test#test';

		const returned = toURL(original);

		expect(returned.href).toEqual('http://test:1234/path/to?q=test#test');
	});
});
