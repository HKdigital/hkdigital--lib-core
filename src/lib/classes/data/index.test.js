import { describe, it, expect } from 'vitest';

import { Selector, IterableTree } from './index.js';

describe('Selector', () => {
	it('should be a class (function)', () => {
		expect(typeof Selector).toBe('function');
	});
});

describe('IterableTree', () => {
	it('should be a class (function)', () => {
		expect(typeof IterableTree).toBe('function');
	});
});
