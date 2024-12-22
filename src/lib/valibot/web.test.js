import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { UrlOrEmptyString, HumanUrl, UrlPath, RelativeUrl, AbsOrRelUrl } from './web.js';

describe('UrlOrEmptyString', () => {
	it('should parse an url or empty string', () => {
		// > Positive test

		expect(v.parse(UrlOrEmptyString, 'http://localhost:1234/path/to?query')).toEqual(
			'http://localhost:1234/path/to?query'
		);

		expect(v.parse(UrlOrEmptyString, '  http://localhost/  ')).toEqual('http://localhost/');

		expect(v.parse(UrlOrEmptyString, '')).toEqual('');
		expect(v.parse(UrlOrEmptyString, '  ')).toEqual('');

		// > Negative test

		try {
			expect(v.parse(UrlOrEmptyString, 123)).toEqual('ups');
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}
	});
});

describe('HumanUrl', () => {
	it('should parse an url without a protocol part', () => {
		// > Positive test

		expect(v.parse(HumanUrl, 'localhost')).toEqual('https://localhost');

		expect(v.parse(HumanUrl, 'www.hkdigital.nl')).toEqual('https://www.hkdigital.nl');

		expect(v.parse(HumanUrl, 'http://localhost:1234/path/to?query')).toEqual(
			'http://localhost:1234/path/to?query'
		);

		expect(v.parse(HumanUrl, '  http://localhost/  ')).toEqual('http://localhost/');

		// > Negative test

		try {
			expect(v.parse(HumanUrl, '')).toEqual('ups');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received ""');
		}

		try {
			expect(v.parse(HumanUrl, '  ')).toEqual('ups');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received ""');
		}

		try {
			expect(v.parse(HumanUrl, 123)).toEqual('ups');
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}
	});
});

describe('UrlPath', () => {
	it('should parse a relative url', () => {
		// > Positive test

		expect(v.parse(UrlPath, '/')).toEqual('/');

		expect(v.parse(UrlPath, '')).toEqual('/');

		expect(v.parse(UrlPath, '/path/to?query')).toEqual('/path/to');

		expect(v.parse(UrlPath, 'path/to')).toEqual('/path/to');

		expect(v.parse(UrlPath, 'path/to?query#hash')).toEqual('/path/to');

		// Expect result to be URL encoded
		expect(v.parse(UrlPath, 'path to')).toEqual('/path%20to');
	});
});

describe('RelativeUrl', () => {
	it('should parse a relative url', () => {
		// > Positive test

		expect(v.parse(RelativeUrl, '/')).toEqual('/');

		expect(v.parse(RelativeUrl, '')).toEqual('/');

		expect(v.parse(RelativeUrl, '/path/to?query')).toEqual('/path/to?query');

		expect(v.parse(RelativeUrl, 'path/to?query')).toEqual('/path/to?query');

		expect(v.parse(RelativeUrl, 'path/to?query#hash')).toEqual('/path/to?query#hash');

		// Expect result to be URL encoded
		expect(v.parse(RelativeUrl, 'path to?query')).toEqual('/path%20to?query');
	});
});

describe('AbsOrRelUrl', () => {
	it('should parse an absolute or relative url', () => {
		// > Positive test

		expect(v.parse(AbsOrRelUrl, 'http://localhost:1234/path/to?query')).toEqual(
			'http://localhost:1234/path/to?query'
		);

		expect(v.parse(AbsOrRelUrl, '/')).toEqual('/');

		expect(v.parse(AbsOrRelUrl, '/path/to?query')).toEqual('/path/to?query');

		expect(v.parse(AbsOrRelUrl, 'path/to?query')).toEqual('/path/to?query');

		expect(v.parse(AbsOrRelUrl, 'path/to?query#hash')).toEqual('/path/to?query#hash');

		// Expect result to be URL encoded
		expect(v.parse(AbsOrRelUrl, 'path to?query')).toEqual('/path%20to?query');

		// > Negative test

		try {
			expect(v.parse(AbsOrRelUrl, 123)).toEqual('ups');
		} catch (e) {
			expect(e.message).toEqual('Invalid type: Expected string but received 123');
		}

		try {
			expect(v.parse(AbsOrRelUrl, '')).toEqual('');
		} catch (e) {
			expect(e.message).toEqual('Invalid URL: Received ""');
		}
	});
});
