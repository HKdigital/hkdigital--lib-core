import { describe, it, expect } from 'vitest';

import { setRequestHeaders } from './index.js';

import { CONTENT_TYPE } from '$lib/constants/http/headers.js';
import { APPLICATION_JSON } from '$lib/constants/mime/application.js';

// > Tests

describe('setRequestHeaders', () => {
	it('should set name-value pairs on a Headers object', () => {
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
