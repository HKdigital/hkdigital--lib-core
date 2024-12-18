import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { APPLICATION_JSON } from '$lib/constants/mime/application.js';
import { CONTENT_TYPE } from '$lib/constants/http/headers.js';

import { jsonGet, jsonPost } from './json-request.js';

import { createJsonFetchResponse } from './mocks.js';

// > Mocks

beforeEach(() => {
	global.fetch = vi.fn();
});

afterEach(() => {
	delete global.fetch;
});

describe('jsonGet', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';

		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const data = await jsonGet({ url });

		expect(data?.hello).toEqual('world');
	});
});

describe('jsonPost', () => {
	it('should fetch data', async () => {
		const url = 'http://localhost';
		const body = JSON.stringify(null);

		fetch.mockResolvedValue(createJsonFetchResponse({ hello: 'world' }));

		const data = await jsonPost({ url, body });

		expect(data?.hello).toEqual('world');

		// const request = new Request();

		// expect(fetch).toHaveBeenCalledWith(url, {
		// 	method: 'POST',
		// 	body,
		// 	headers: {
		// 		[CONTENT_TYPE]: APPLICATION_JSON
		// 	}
		// });
	});
});
