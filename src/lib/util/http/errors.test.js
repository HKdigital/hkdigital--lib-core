import { describe, it, expect } from 'vitest';

import { getErrorFromResponse } from './errors.js';

// > Tests

describe('getErrorFromResponse', () => {
	it('should return error using property `message`', async () => {
		const response = Response.json({
			message: 'ups'
		});

		const error = await getErrorFromResponse(response);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups');
	});
});

describe('getErrorFromResponse', () => {
	it('should return error using property `error`', async () => {
		const response = Response.json({
			error: 'ups'
		});

		const error = await getErrorFromResponse(response);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups');
	});
});

describe('getErrorFromResponse', () => {
	it('should return error using property `errors`', async () => {
		const errors = [{ message: 'ups1' }, 'ups2'];

		const response = Response.json({
			errors
		});

		const error = await getErrorFromResponse(response);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups1, ups2');
		expect(error.details).toEqual(errors);
	});
});

describe('getErrorFromResponse', () => {
	it('should return error using property `messages`', async () => {
		const messages = [{ message: 'ups1' }, 'ups2'];

		const response = Response.json({
			messages
		});

		const error = await getErrorFromResponse(response);

		// console.log(456, error.details);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups1, ups2');
		expect(error.details).toEqual(messages);
	});
});

describe('getErrorFromResponse', () => {
	it('should return error using response text', async () => {
		const response = new Response(new Blob(['ups']));

		const error = await getErrorFromResponse(response);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups');
	});
});

describe('getErrorFromResponse', () => {
	it('should return error using status text', async () => {
		const response = new Response(new Blob(), {
			status: 501,
			statusText: 'ups'
		});

		const error = await getErrorFromResponse(response);

		expect(error instanceof Error).toEqual(true);
		expect(error.message).toEqual('ups');
	});
});
