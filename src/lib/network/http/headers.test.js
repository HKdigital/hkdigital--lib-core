import { describe, it, expect } from 'vitest';

import { setRequestHeaders } from './headers.js';

import { CONTENT_TYPE } from '$lib/constants/http/headers.js';
import { APPLICATION_JSON } from '$lib/constants/mime/application.js';

// > Tests

describe('setRequestHeaders', () => {
	it('should use name-value pairs from object', () => {
		const headers = new Headers();

		setRequestHeaders(headers, {
			[CONTENT_TYPE]: APPLICATION_JSON
		});

		const arr = Array.from(headers.entries());
		// console.log(arr);

		expect(arr[0][0]).toEqual(CONTENT_TYPE);
		expect(arr[0][1]).toEqual(APPLICATION_JSON);
	});
});

describe('setRequestHeaders', () => {
	it('should use name-value pairs from array', () => {
		const headers = new Headers();

		setRequestHeaders(headers, [[CONTENT_TYPE, APPLICATION_JSON]]);

		const arr = Array.from(headers.entries());
		// console.log(arr);

		expect(arr[0][0]).toEqual(CONTENT_TYPE);
		expect(arr[0][1]).toEqual(APPLICATION_JSON);
	});
});

describe('setRequestHeaders', () => {
	it('should accept null as pairs', () => {
		const headers = new Headers();

		setRequestHeaders(headers, null);
	});
});

describe('setRequestHeaders', () => {
	it('should accept null as pairs', () => {
		const headers = new Headers();

		try {
			setRequestHeaders(headers, 123);
		} catch (e) {
			expect(e.message).toEqual('Invalid value for parameter [pairs]');
		}
	});
});
