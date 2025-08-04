import { describe, it, expect } from 'vitest';

import * as v from 'valibot';

import { UrlOrEmptyString, HumanUrl, UrlPath, RelativeUrl, AbsOrRelUrl, Slug } from './url.js';

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

describe('Slug', () => {
	it('should parse and transform valid URL slugs', () => {
		// > Positive test - lowercase transformation
		expect(v.parse(Slug, 'hello')).toEqual('hello');
		expect(v.parse(Slug, 'Hello')).toEqual('hello');
		expect(v.parse(Slug, 'HELLO')).toEqual('hello');
		expect(v.parse(Slug, 'Hello-World')).toEqual('hello-world');
		expect(v.parse(Slug, 'MY-BLOG-POST')).toEqual('my-blog-post');
		
		// > Positive test - trim whitespace
		expect(v.parse(Slug, '  hello-world  ')).toEqual('hello-world');
		expect(v.parse(Slug, '\thello\t')).toEqual('hello');
		
		// > Positive test - valid patterns
		expect(v.parse(Slug, 'user-123')).toEqual('user-123');
		expect(v.parse(Slug, 'product-abc-123')).toEqual('product-abc-123');
		expect(v.parse(Slug, 'a')).toEqual('a');
		expect(v.parse(Slug, '1')).toEqual('1');
		expect(v.parse(Slug, 'abc123')).toEqual('abc123');
	});

	it('should throw on invalid URL slugs', () => {
		// > Negative test - invalid patterns
		const invalidCases = [
			'',
			'-hello',
			'hello-',
			'hello--world',
			'hello_world',
			'hello world',
			'hello.world',
			'hello/world',
			'hello@world',
			'hello#world',
			'hello?world'
		];

		for (const invalidSlug of invalidCases) {
			try {
				v.parse(Slug, invalidSlug);
				expect.fail(`Expected ${invalidSlug} to throw, but it didn't`);
			} catch (e) {
				expect(e.message).toContain('Must be a valid URL slug');
			}
		}
	});

	it('should throw on non-string input', () => {
		try {
			v.parse(Slug, 123);
			expect.fail('Expected non-string input to throw');
		} catch (e) {
			expect(e.message).toContain('Invalid type: Expected string');
		}
	});
});
