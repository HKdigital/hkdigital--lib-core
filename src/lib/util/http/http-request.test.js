import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { httpGet, httpPost, getResponseSize } from './http-request.js';

import { CONTENT_LENGTH } from '$lib/constants/http/headers.js';

import { createJsonFetchResponse } from './mocks.js';

// > Mocks

beforeEach(() => {
	global.fetch = vi.fn();
});

afterEach(() => {
	delete global.fetch;
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

describe('getResponseSize', () => {
	it('should return the response size', async () => {
		expect(getResponseSize({ headers: new Headers({ [CONTENT_LENGTH]: 1234 }) })).toEqual(1234);

		expect(getResponseSize({ headers: new Headers() })).toEqual(0);
	});
});
