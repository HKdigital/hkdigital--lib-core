import { describe, it, expect } from 'vitest';

import { HkPromise } from './index.js';

describe('HkPromise', () => {
	it('should be a Promise', () => {
		const promise = new HkPromise();

		expect(promise).toBeInstanceOf(Promise);
	});
});

describe('HkPromise', () => {
	it('should extend Promise functionality', () => {
		const promise = new HkPromise();

		expect(typeof promise.then).toBe('function');
		expect(typeof promise.catch).toBe('function');

		expect(promise.pending).toBe(true);
	});
});
