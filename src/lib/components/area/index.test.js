import { describe, it, expect } from 'vitest';

import { HkArea, HkGridArea } from './index.js';

describe('HkArea', () => {
	it('should be a component (function)', () => {
		expect(typeof HkArea).toBe('function');
	});
});

describe('HkGridArea', () => {
	it('should be a component (function)', () => {
		expect(typeof HkGridArea).toBe('function');
	});
});
