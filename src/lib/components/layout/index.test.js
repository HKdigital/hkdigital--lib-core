import { describe, it, expect } from 'vitest';

import {
	HkAppLayout,
	createOrGetAppLayoutState,
	createAppLayoutState,
	getAppLayoutState,
	GridLayersLayout
} from './index.js';

describe('HkAppLayout', () => {
	it('should be a component (function)', () => {
		expect(typeof HkAppLayout).toBe('function');
	});
});

describe('createOrGetAppLayoutState', () => {
	it('should be a function', () => {
		expect(typeof createOrGetAppLayoutState).toBe('function');
	});
});

describe('createAppLayoutState', () => {
	it('should be a function', () => {
		expect(typeof createAppLayoutState).toBe('function');
	});
});

describe('getAppLayoutState', () => {
	it('should be a function', () => {
		expect(typeof getAppLayoutState).toBe('function');
	});
});

describe('GridLayersLayout', () => {
	it('should be a component (function)', () => {
		expect(typeof GridLayersLayout).toBe('function');
	});
});
