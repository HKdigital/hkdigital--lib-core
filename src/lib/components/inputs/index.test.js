import { describe, it, expect } from 'vitest';

import { TextInput } from './index.js';

describe('TextInput', () => {
	it('should be a component (function)', () => {
		expect(typeof TextInput).toBe('function');
	});
});
