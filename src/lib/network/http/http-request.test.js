import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
	httpGet,
	httpPost,
	httpPut,
	httpDelete,
	httpPatch,
	httpOptions,
	httpHead,
	httpRequest
} from './http-request.js';

import { METHOD_GET } from '$lib/constants/http/methods.js';
import { AbortError, TimeoutError } from '$lib/errors/api.js';

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
	// @ts-ignore
	if (global.AbortController && global.AbortController !== AbortController) {
		delete global.AbortController;
	}
	lastRequestInit = null;
	vi.useRealTimers();
	vi.restoreAllMocks();
});

// > Tests

describe('httpGet', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const response = await httpGet({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.hello).toEqual('world');
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100; // Shorter timeout for faster test

		vi.useFakeTimers();

		// Mock abort function
		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// Mock fetch to return a promise that never resolves
		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		// Start the request with a timeout, but disable caching
		httpGet({
			url,
			timeoutMs,
			cacheEnabled: false // Disable cache for this test
		});

		// Advance timers to trigger the timeout
		vi.advanceTimersByTime(timeoutMs + 50);

		// Verify that abort was called with a TimeoutError
		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
		expect(abortArg.message).toContain(timeoutMs.toString());
	});

	it('should allow manual abort via requestHandler', async () => {
		const url = 'http://localhost';
		let abortFunction;

		// Mock abort function
		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// Mock fetch to return a promise that never resolves
		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		// Start the request with a requestHandler to get the abort function
		httpGet({
			url,
			cacheEnabled: false, // Disable cache for this test
			requestHandler: ({ abort }) => {
				abortFunction = abort;
			}
		});

		// Call abort with a custom reason
		const abortReason = new Error('Custom abort reason');
		// @ts-ignore
		abortFunction(abortReason);

		// Verify that abort was called with the custom reason
		expect(abortMock).toHaveBeenCalledWith(abortReason);
	});

	it('should abort with default AbortError when no reason provided', async () => {
		const url = 'http://localhost';
		let abortFunction;

		// Mock abort function
		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// Mock fetch to return a promise that never resolves
		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		// Start the request with a requestHandler to get the abort function
		// Explicitly disable caching to ensure the code path is followed
		const promise = httpGet({
			url,
			cacheEnabled: false, // Disable cache for this test
			requestHandler: ({ abort }) => {
				abortFunction = abort;
			}
		});

		// Ensure abortFunction was set
		expect(abortFunction).toBeDefined();

		// Call abort without a reason
		// @ts-ignore
		abortFunction();

		// Verify that abort was called with an AbortError
		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof AbortError).toBe(true);
		expect(abortArg.message).toContain('aborted');
		expect(abortArg.message).toContain(url);
	});

	it('should support setting timeout via requestHandler', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100; // Shorter timeout for faster test

		vi.useFakeTimers();

		// Mock abort function
		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// Mock fetch to return a promise that never resolves
		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		// Spy on setTimeout
		const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

		// Start the request with a requestHandler to set the timeout
		httpGet({
			url,
			cacheEnabled: false, // Disable cache for this test
			requestHandler: ({ timeout }) => {
				// Explicitly call timeout with our test value
				timeout(timeoutMs);
			}
		});

		// Verify setTimeout was called with our timeout value
		expect(setTimeoutSpy).toHaveBeenCalled();

		// Advance timers to trigger the timeout
		vi.advanceTimersByTime(timeoutMs + 50);

		// Verify that abort was called with a TimeoutError
		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
		expect(abortArg.message).toContain(timeoutMs.toString());
	});
});

describe('httpPost', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const response = await httpPost({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.hello).toEqual('world');
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100; // Shorter timeout for faster test

		vi.useFakeTimers();

		// Mock abort function
		const abortMock = vi.fn();

		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// Mock fetch to return a promise that never resolves
		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		// Start the request with a timeout
		httpPost({ url, timeoutMs });

		// Advance timers to trigger the timeout
		vi.advanceTimersByTime(timeoutMs + 50);

		// Verify that abort was called with a TimeoutError
		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
		expect(abortArg.message).toContain(timeoutMs.toString());
	});
});

// Add these test suites to your existing http-request.test.js file

describe('httpPut', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ updated: true }));

		const response = await httpPut({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.updated).toEqual(true);
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100;

		vi.useFakeTimers();

		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		httpPut({ url, timeoutMs });

		vi.advanceTimersByTime(timeoutMs + 50);

		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
	});
});

describe('httpDelete', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ deleted: true }));

		const response = await httpDelete({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.deleted).toEqual(true);
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100;

		vi.useFakeTimers();

		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		httpDelete({ url, timeoutMs });

		vi.advanceTimersByTime(timeoutMs + 50);

		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
	});
});

describe('httpPatch', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ patched: true }));

		const response = await httpPatch({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.patched).toEqual(true);
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100;

		vi.useFakeTimers();

		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		httpPatch({ url, timeoutMs });

		vi.advanceTimersByTime(timeoutMs + 50);

		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
	});
});

describe('httpOptions', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(
			createJsonFetchResponse({ methods: ['GET', 'POST', 'PUT'] })
		);

		const response = await httpOptions({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.methods).toEqual(['GET', 'POST', 'PUT']);
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100;

		vi.useFakeTimers();

		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		httpOptions({ url, timeoutMs });

		vi.advanceTimersByTime(timeoutMs + 50);

		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
	});
});

describe('httpHead', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		// @ts-ignore
		fetch.mockResolvedValue(createJsonFetchResponse({ exists: true }));

		const response = await httpHead({ url });

		expect(response?.json).toBeTypeOf('function');

		const parsedResponse = await response.json();

		expect(parsedResponse?.exists).toEqual(true);
	});

	it('should throw TimeoutError when request times out', async () => {
		const url = 'http://localhost';
		const timeoutMs = 100;

		vi.useFakeTimers();

		const abortMock = vi.fn();
		// @ts-ignore
		global.AbortController = vi.fn(() => ({
			signal: { aborted: false },
			abort: abortMock
		}));

		// @ts-ignore
		fetch.mockImplementation(() => new Promise(() => {}));

		httpHead({ url, timeoutMs });

		vi.advanceTimersByTime(timeoutMs + 50);

		expect(abortMock).toHaveBeenCalled();
		const abortArg = abortMock.mock.calls[0][0];
		expect(abortArg instanceof TimeoutError).toBe(true);
		expect(abortArg.message).toContain('timed out');
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

	// Update the credentials test
	it('should set credentials to "omit" when withCredentials is false', async () => {
		const url = 'http://localhost';

		// Reset lastRequestInit
		lastRequestInit = null;

		// Make sure Request constructor captures init
		global.Request = vi.fn().mockImplementation((url, init) => {
			lastRequestInit = init;
			return { url, init };
		});

		// Call httpRequest with withCredentials set to false
		await httpRequest({
			method: METHOD_GET,
			url,
			withCredentials: false,
			cacheEnabled: false
		});

		// Verify Request was created with correct credentials
		expect(lastRequestInit).not.toBeNull();
		// @ts-ignore
		expect(lastRequestInit.credentials).toBe('omit');
	});

	it('should set credentials to "omit" when withCredentials is not provided', async () => {
		const url = 'http://localhost';

		// Call httpRequest without specifying withCredentials
		await httpRequest({
			method: METHOD_GET,
			url,
			cacheEnabled: false
		});

		// Verify Request was created with credentials: 'omit' (default)
		expect(lastRequestInit.credentials).toBe('omit');
	});

	it('should throw an error when urlSearchParams is not an instance of URLSearchParams', async () => {
		const url = 'http://localhost';
		const invalidSearchParams = { foo: 'bar' };

		try {
			await httpRequest({
				method: METHOD_GET,
				url,
				urlSearchParams: invalidSearchParams,
				cacheEnabled: false
			});
			expect.fail('Should have thrown an error');
		} catch (error) {
			// Check if error message contains key terms rather than exact message
			expect(error.message).toMatch(/urlSearchParams|URLSearchParams/);
		}
	});

	// Duplicate URL parameter test
	it('should throw an error when trying to set a URL search parameter that already exists', async () => {
		const url = 'http://localhost?existing=value';
		const searchParams = new URLSearchParams();
		searchParams.set('existing', 'newvalue');

		try {
			await httpRequest({
				method: METHOD_GET,
				url,
				urlSearchParams: searchParams
			});
			expect.fail('Should have thrown an error');
		} catch (error) {
			expect(error.message).toContain(
				'Cannot set URL search parameter [existing]'
			);
			expect(error.message).toContain('already set');
		}
	});
});
