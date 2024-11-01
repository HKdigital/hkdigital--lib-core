import { describe, it, expect } from 'vitest';

import {
	HkTabBar,
	createOrGetTabBarState,
	createTabBarState,
	getTabBarState,
	HkTabBarSelector,
	createOrGetTabBarSelectorState,
	createTabBarSelectorState,
	getTabBarSelectorState
} from './index.js';

describe('HkTabBar', () => {
	it('should be a component (function)', () => {
		expect(typeof HkTabBar).toBe('function');
	});
});

describe('createOrGetTabBarState', () => {
	it('should be a function', () => {
		expect(typeof createOrGetTabBarState).toBe('function');
	});
});

describe('createTabBarState', () => {
	it('should be a function', () => {
		expect(typeof createTabBarState).toBe('function');
	});
});

describe('getTabBarState', () => {
	it('should be a function', () => {
		expect(typeof getTabBarState).toBe('function');
	});
});

describe('HkTabBarSelector', () => {
	it('should be a component (function)', () => {
		expect(typeof HkTabBarSelector).toBe('function');
	});
});

describe('createOrGetTabBarSelectorState', () => {
	it('should be a function', () => {
		expect(typeof createOrGetTabBarSelectorState).toBe('function');
	});
});

describe('createTabBarSelectorState', () => {
	it('should be a function', () => {
		expect(typeof createTabBarSelectorState).toBe('function');
	});
});

describe('getTabBarSelectorState', () => {
	it('should be a function', () => {
		expect(typeof getTabBarSelectorState).toBe('function');
	});
});
