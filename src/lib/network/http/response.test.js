import { describe, it, expect, vi } from 'vitest';

import {
	WWW_AUTHENTICATE,
	CONTENT_LENGTH
} from '$lib/constants/http/headers.js';
import { ResponseError } from '$lib/network/errors.js';

import {
	expectResponseOk,
	getResponseSize,
	waitForAndCheckResponse,
	loadResponseBuffer
} from './response.js';

import { createStreamedResponse } from './mocks.js';

// > Tests

describe('expectResponseOk', () => {
	it('should pass if response if ok', () => {
		const response = new Response();
		const url = 'http://localhost';

		expectResponseOk(response, url);
	});

	it('should throw not authorized for 401 response', async () => {
		const response = new Response(new Blob(), {
			status: 401,
			statusText: 'Unauthorized',
			headers: new Headers([[WWW_AUTHENTICATE, 'Bearer error=no access']])
		});
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned [401] Unauthorized (Bearer error=no access) [url=http://localhost/]'
			);
		}
	});

	it('should throw not found for 404 response', async () => {
		const response = new Response(new Blob(), {
			status: 404,
			statusText: 'Not Found'
		});
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned - 404 Not Found [url=http://localhost/]'
			);
		}
	});

	it('should throw an error for an 501 response', async () => {
		const response = new Response(new Blob(), {
			status: 501,
			statusText: 'Internal Server Error'
		});
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned - 501 Internal Server Error [url=http://localhost/]'
			);
		}
	});

	// New test for 403 Forbidden
	it('should throw a proper error for 403 Forbidden', async () => {
		const response = new Response(new Blob(), {
			status: 403,
			statusText: 'Forbidden'
		});
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned - 403 Forbidden [url=http://localhost/]'
			);
		}
	});
});

describe('getResponseSize', () => {
	it('should return the response size', async () => {
		expect(
			getResponseSize(
				new Response(null, {
					headers: new Headers({ [CONTENT_LENGTH]: '1234' })
				})
			)
		).toEqual(1234);

		expect(
			getResponseSize(new Response(null, { headers: new Headers() }))
		).toEqual(0);
	});
});

describe('waitForAndCheckResponse', () => {
	it('should wait for a response', async () => {
		const responsePromise = Promise.resolve(new Response());
		const url = 'http://localhost';

		await waitForAndCheckResponse(responsePromise, url);
	});

	it('should throw a network error for non-ok responses', async () => {
		const responsePromise = Promise.resolve(Response.error());
		const url = 'http://localhost';

		try {
			await waitForAndCheckResponse(responsePromise, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'A network error occurred for request [http://localhost/]'
			);
			expect(e instanceof ResponseError).toBe(true);
		}
	});

	it('should throw a network error for TypeError', async () => {
		const responsePromise = Promise.reject(new TypeError('ups'));
		const url = 'http://localhost';

		try {
			await waitForAndCheckResponse(responsePromise, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.message).toEqual(
				'A network error occurred for request [http://localhost/]'
			);
			expect(e instanceof ResponseError).toBe(true);
			expect(e.cause instanceof TypeError).toBe(true);
			expect(e.cause.message).toEqual('ups');
		}
	});

	// New test for general rejection
	it('should rethrow non-network errors', async () => {
		const customError = new Error('Custom error');
		const responsePromise = Promise.reject(customError);
		const url = 'http://localhost';

		try {
			await waitForAndCheckResponse(responsePromise, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e).toBe(customError);
		}
	});

	it('should throw HttpError with response body for HTTP errors', async () => {
		const mockResponse = {
			ok: false,
			status: 404,
			statusText: 'Not Found',
			text: vi.fn().mockResolvedValue('{"error": "Resource not found", "code": "NOT_FOUND"}')
		};
		const responsePromise = Promise.resolve(mockResponse);
		const url = 'http://localhost/api/resource';

		try {
			await waitForAndCheckResponse(responsePromise, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.constructor.name).toBe('HttpError');
			expect(e.status).toBe(404);
			expect(e.message).toBe('HTTP 404: Not Found');
			expect(e.details).toEqual({ error: 'Resource not found', code: 'NOT_FOUND' });
		}
	});

	it('should handle plain text response bodies in HttpError', async () => {
		const mockResponse = {
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: vi.fn().mockResolvedValue('Server is temporarily unavailable')
		};
		const responsePromise = Promise.resolve(mockResponse);
		const url = 'http://localhost/api/resource';

		try {
			await waitForAndCheckResponse(responsePromise, url);
			expect.fail('Should have thrown an error');
		} catch (e) {
			expect(e.constructor.name).toBe('HttpError');
			expect(e.status).toBe(500);
			expect(e.message).toBe('HTTP 500: Internal Server Error');
			expect(e.details).toBe('Server is temporarily unavailable');
		}
	});
});

describe('loadResponseBuffer', () => {
	it('should load response as ArrayBuffer', async () => {
		const responseSize = 100;
		const response = createStreamedResponse(new ArrayBuffer(responseSize));

		const onProgress = vi.fn();

		const { bufferPromise, abort } = loadResponseBuffer(response, onProgress);

		expect(abort).toBeTypeOf('function');

		const buffer = await bufferPromise;

		expect(buffer).toBeInstanceOf(ArrayBuffer);
		expect(buffer.byteLength).toEqual(responseSize);
	});

	// New test for progress callback
	it('should call progress callback during loading', async () => {
		const responseSize = 100;
		const response = createStreamedResponse(new ArrayBuffer(responseSize));

		const onProgress = vi.fn();

		const { bufferPromise } = loadResponseBuffer(response, onProgress);
		await bufferPromise;

		// Progress should be called at least twice: once at start, once at completion
		expect(onProgress.mock.calls.length).toBeGreaterThanOrEqual(2);

		// First call should be with 0 bytes loaded
		expect(onProgress.mock.calls[0][0].bytesLoaded).toBe(0);

		// Last call should be with full size loaded
		const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1][0];
		expect(lastCall.bytesLoaded).toBe(responseSize);
	});

	it('should abort loading when abort is called', async () => {
		// Create a mock response with a reader that allows us to control reading
		const mockReader = {
			read: vi.fn(),
			cancel: vi.fn() // Add a cancel method to the reader
		};
		const mockBody = { getReader: () => mockReader };
		const mockResponse = { body: mockBody, headers: new Headers() };

		// First read returns some data
		mockReader.read.mockResolvedValueOnce({
			done: false,
			value: new Uint8Array([1, 2, 3, 4])
		});

		// Second read will resolve after a delay (simulating network latency)
		mockReader.read.mockImplementationOnce(() => {
			return new Promise((resolve) => {
				// This will resolve, but only after a long delay
				// The abort should happen before this resolves
				setTimeout(() => {
					resolve({ done: true, value: undefined });
				}, 1000);
			});
		});

		// @ts-ignore
		const { bufferPromise, abort } = loadResponseBuffer(mockResponse);

		// Call abort immediately
		abort();

		const buffer = await bufferPromise;

		// Should have the data from the first read only
		expect(buffer.byteLength).toBe(4);

		// Only the first read should have happened
		expect(mockReader.read).toHaveBeenCalledTimes(1);
	});

	// New test for missing response body
	it('should throw an error when response body is missing', () => {
		const response = { headers: new Headers() };

		expect(() => {
			// @ts-ignore
			loadResponseBuffer(response);
		}).toThrow('Missing [response.body]');
	});
});
