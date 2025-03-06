import { describe, it, expect } from 'vitest';

import { SteezeIcon, HkIcon, HkTabIcon } from './index.js';

describe('SteezeIcon', () => {
	it('should be a component (function)', () => {
		expect(typeof SteezeIcon).toBe('function');
	});
});

describe('HkIcon', () => {
	it('should be a component (function)', () => {
		expect(typeof HkIcon).toBe('function');
	});
});

describe('HkTabIcon', () => {
	it('should be a component (function)', () => {
		expect(typeof HkTabIcon).toBe('function');
	});
});
