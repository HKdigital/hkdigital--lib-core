import { describe, it, expect } from 'vitest';

import { getErrorFromResponse, setRequestHeaders, expectResponseOk, toURL } from './index.js';

describe('getErrorFromResponse', () => {
	it('should be a function', () => {
		expect(typeof getErrorFromResponse).toBe('function');
	});
});

describe('setRequestHeaders', () => {
	it('should be a function', () => {
		expect(typeof setRequestHeaders).toBe('function');
	});
});

describe('expectResponseOk', () => {
	it('should be a function', () => {
		expect(typeof expectResponseOk).toBe('function');
	});
});

describe('toURL', () => {
	it('should be a function', () => {
		expect(typeof toURL).toBe('function');
	});
});
