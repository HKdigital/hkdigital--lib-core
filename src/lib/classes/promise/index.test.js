import { describe, it, expect } from 'vitest';

import { HkPromise } from './index.js';

describe('HkPromise', () => {
	it('should be a class (function)', () => {
		expect(typeof HkPromise).toBe('function');
	});
});
