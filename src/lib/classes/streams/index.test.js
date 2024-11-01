import { describe, it, expect } from 'vitest';

import { LogTransformStream, ServerEventsStore, TimeStampSource } from './index.js';

describe('LogTransformStream', () => {
	it('should be a class (function)', () => {
		expect(typeof LogTransformStream).toBe('function');
	});
});

describe('ServerEventsStore', () => {
	it('should be a class (function)', () => {
		expect(typeof ServerEventsStore).toBe('function');
	});
});

describe('TimeStampSource', () => {
	it('should be a class (function)', () => {
		expect(typeof TimeStampSource).toBe('function');
	});
});
