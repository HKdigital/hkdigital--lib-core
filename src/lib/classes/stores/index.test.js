import { describe, it, expect } from 'vitest';

import { SubscribersCount } from './index.js';

describe('SubscribersCount', () => {
	it('should be a class (function)', () => {
		expect(typeof SubscribersCount).toBe('function');
	});
});
