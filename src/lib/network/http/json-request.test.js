import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { APPLICATION_JSON } from '$lib/constants/mime/application.js';
import { CONTENT_TYPE } from '$lib/constants/http/headers.js';
import { ResponseError } from '$lib/network/errors.js';

import { jsonGet, jsonPost } from './json-request.js';
import { createJsonFetchResponse } from './mocks.js';

// > Mocks

// Keep track of Request constructor calls
let lastRequestInit = null;

beforeEach(() => {
	// Mock the Request constructor to capture the init options
	global.Request = vi.fn().mockImplementation((url, init) => {
		lastRequestInit = init;
		return { url, init };
	});

	global.fetch = vi.fn();
});

afterEach(() => {
	// @ts-ignore
	delete global.fetch;
	// @ts-ignore
	delete global.Request;
	lastRequestInit = null;
});

describe('jsonGet', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const data = await jsonGet({ url });

		expect(data?.hello).toEqual('world');
	});

	it('should set credentials to "include" when withCredentials is true', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonGet({
			url,
			withCredentials: true
		});

		// Verify Request was created with credentials: 'include'
		expect(lastRequestInit.credentials).toBe('include');
	});

	it('should set credentials to "omit" when withCredentials is false', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonGet({
			url,
			withCredentials: false
		});

		// Verify Request was created with credentials: 'omit'
		expect(lastRequestInit.credentials).toBe('omit');
	});

	it('should set credentials to "omit" when withCredentials is not provided', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonGet({
			url
		});

		// Verify Request was created with credentials: 'omit' (default)
		expect(lastRequestInit.credentials).toBe('omit');
	});

	// Add test for JSON parsing error
	it('should throw ResponseError when response is not valid JSON', async () => {
		const url = 'http://localhost';

		// Mock a non-JSON response
		global.fetch = vi.fn().mockResolvedValue(
			new Response('Not JSON content', {
				headers: { 'content-type': 'text/plain' }
			})
		);

		try {
			await jsonGet({ url, cacheEnabled: false });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain('Failed to JSON decode server response');
			expect(error.message).toContain('http://localhost');
			expect(error.cause).toBeDefined();
		}
	});

	// Add test for error response
	it('should throw ResponseError when server returns error property', async () => {
		const url = 'http://localhost';
		const errorMessage = 'Invalid request parameter';

		// Mock a JSON response with error property
		global.fetch = vi
			.fn()
			.mockResolvedValue(createJsonFetchResponse({ error: errorMessage }));

		try {
			await jsonGet({ url });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain(errorMessage);
		}
	});

	// Add test for network error
	it('should handle network errors correctly', async () => {
		const url = 'http://localhost';

		// Mock a network error
		global.fetch = vi.fn().mockRejectedValue(new TypeError('Network error'));

		try {
			await jsonGet({ url });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain('network error');
			expect(error.cause instanceof TypeError).toBe(true);
		}
	});
});

describe('jsonPost', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify(null);

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const data = await jsonPost({ url, body });

		expect(data?.hello).toEqual('world');
	});

	it('should set credentials to "include" when withCredentials is true', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify(null);

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonPost({
			url,
			body,
			withCredentials: true
		});

		// Verify Request was created with credentials: 'include'
		expect(lastRequestInit.credentials).toBe('include');
	});

	it('should set credentials to "omit" when withCredentials is false', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify(null);

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonPost({
			url,
			body,
			withCredentials: false
		});

		// Verify Request was created with credentials: 'omit'
		expect(lastRequestInit.credentials).toBe('omit');
	});

	it('should set credentials to "omit" when withCredentials is not provided', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify(null);

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		await jsonPost({
			url,
			body
		});

		// Verify Request was created with credentials: 'omit' (default)
		expect(lastRequestInit.credentials).toBe('omit');
	});

	// Add test for JSON parsing error
	it('should throw ResponseError when response is not valid JSON', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify({ data: 'test' });

		// Mock a non-JSON response
		global.fetch = vi.fn().mockResolvedValue(
			new Response('Not JSON content', {
				headers: { 'content-type': 'text/plain' }
			})
		);

		try {
			await jsonPost({ url, body });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain('Failed to JSON decode server response');
			expect(error.message).toContain('http://localhost');
			expect(error.cause).toBeDefined();
		}
	});

	// Add test for error response
	it('should throw ResponseError when server returns error property', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify({ data: 'test' });
		const errorMessage = 'Invalid request parameter';

		// Mock a JSON response with error property
		global.fetch = vi
			.fn()
			.mockResolvedValue(createJsonFetchResponse({ error: errorMessage }));

		try {
			await jsonPost({ url, body });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain(errorMessage);
		}
	});

	// Add test for network error
	it('should handle network errors correctly', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify({ data: 'test' });

		// Mock a network error
		global.fetch = vi.fn().mockRejectedValue(new TypeError('Network error'));

		try {
			await jsonPost({ url, body });
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error instanceof ResponseError).toBe(true);
			expect(error.message).toContain('network error');
			expect(error.cause instanceof TypeError).toBe(true);
		}
	});

	// Add test for content type validation
	it('should throw an error when body is not a string but content-type is application/json', async () => {
		const url = 'http://localhost';
		const body = { data: 'test' }; // Not stringified

		try {
			await jsonPost({
				url,
				body,
				headers: {
					[CONTENT_TYPE]: APPLICATION_JSON
				}
			});
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error.message).toContain('body is not a (JSON encoded) string');
		}
	});
});
