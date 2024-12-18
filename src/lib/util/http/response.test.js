import { describe, it, expect } from 'vitest';

import { WWW_AUTHENTICATE } from '$lib/constants/http/headers.js';

import { expectResponseOk, waitForAndCheckResponse } from './response.js';

// import { CONTENT_TYPE } from '$lib/constants/http/headers.js';
// import { APPLICATION_JSON } from '$lib/constants/mime/application.js';

// > Tests

describe('expectResponseOk', () => {
	it('should pass if response if ok', () => {
		const response = new Response();
		const url = 'http://localhost';

		expectResponseOk(response, url);
	});
});

describe('expectResponseOk', () => {
	it('should throw not authorized for 401 response', async () => {
		const response = new Response(new Blob(), {
			status: 401,
			statusText: 'Unauthorized',
			headers: new Headers([[WWW_AUTHENTICATE, 'Bearer error=no access']])
		});
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned [401] Unauthorized (Bearer error=no access) [url=http://localhost/]'
			);
		}
	});
});

describe('expectResponseOk', () => {
	it('should throw not found for 404 response', async () => {
		const response = new Response(new Blob(), { status: 404, statusText: 'Not Found' });
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
		} catch (e) {
			expect(e.message).toEqual('Server returned - 404 Not Found [url=http://localhost/]');
		}
	});
});

describe('expectResponseOk', () => {
	it('should throw an error for an 501 response', async () => {
		const response = new Response(new Blob(), { status: 501, statusText: 'Internal Server Error' });
		const url = 'http://localhost';

		try {
			await expectResponseOk(response, url);
		} catch (e) {
			expect(e.message).toEqual(
				'Server returned - 501 Internal Server Error [url=http://localhost/]'
			);
		}
	});
});

describe('waitForAndCheckResponse', () => {
	it('should wait for a response', async () => {
		const responsePromise = Promise.resolve(new Response());
		const url = 'http://localhost';

		await waitForAndCheckResponse(responsePromise, url);
	});
});

describe('waitForAndCheckResponse', () => {
	it('should throw a network error', async () => {
		const responsePromise = Promise.resolve(Response.error());
		const url = 'http://localhost';

		try {
			await waitForAndCheckResponse(responsePromise, url);
		} catch (e) {
			expect(e.message).toEqual('A network error occurred for request [http://localhost/]');
		}
	});
});

describe('waitForAndCheckResponse', () => {
	it('should throw a network error', async () => {
		const responsePromise = Promise.reject(new TypeError('ups'));
		const url = 'http://localhost';

		try {
			await waitForAndCheckResponse(responsePromise, url);
		} catch (e) {
			expect(e.message).toEqual('A network error occurred for request [http://localhost/]');
		}
	});
});
