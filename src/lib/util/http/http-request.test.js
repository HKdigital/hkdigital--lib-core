import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { httpGet, httpPost, httpRequest } from './http-request.js';
import { METHOD_GET } from '$lib/constants/http/methods.js';

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

	// Mock fetch to return a basic response
	global.fetch = vi.fn().mockImplementation(() => {
		return Promise.resolve(new Response());
	});
});

afterEach(() => {
	// @ts-ignore
	delete global.fetch;
	lastRequestInit = null;
});

// > Tests

describe('httpGet', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const response = await httpGet({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.hello).toEqual('world');
	});
});

describe('httpPost', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const response = await httpPost({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.hello).toEqual('world');
	});
});

describe('httpRequest', () => {
	it('should set credentials to "include" when withCredentials is true', async () => {
		const url = 'http://localhost';

		// Call httpRequest with withCredentials set to true
		await httpRequest({
			method: METHOD_GET,
			url,
			withCredentials: true
		});

		// Verify Request was created with credentials: 'include'
		expect(lastRequestInit.credentials).toBe('include');
	});

	it('should set credentials to "omit" when withCredentials is false', async () => {
		const url = 'http://localhost';

		// Call httpRequest with withCredentials set to false
		await httpRequest({
			method: METHOD_GET,
			url,
			withCredentials: false
		});

		// Verify Request was created with credentials: 'omit'
		expect(lastRequestInit.credentials).toBe('omit');
	});

	it('should set credentials to "omit" when withCredentials is not provided', async () => {
		const url = 'http://localhost';

		// Call httpRequest without specifying withCredentials
		await httpRequest({
			method: METHOD_GET,
			url
		});

		// Verify Request was created with credentials: 'omit' (default)
		expect(lastRequestInit.credentials).toBe('omit');
	});
});
