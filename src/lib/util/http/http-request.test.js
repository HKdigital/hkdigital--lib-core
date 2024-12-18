import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { httpGet, httpPost } from './http-request.js';

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
