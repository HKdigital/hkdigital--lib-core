import { describe, it, expect } from 'vitest';

import { noop, once, debounce, defer } from './index.js';

describe('noop', () => {
	it('should be a function', () => {
		expect(typeof noop).toBe('function');
	});
});

describe('once', () => {
	it('should be a function', () => {
		expect(typeof once).toBe('function');
	});
});

describe('debounce', () => {
	it('should be a function', () => {
		expect(typeof debounce).toBe('function');
	});
});

describe('defer', () => {
	it('should be a function', () => {
		expect(typeof defer).toBe('function');
	});
});
