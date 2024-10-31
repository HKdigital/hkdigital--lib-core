import { describe, it, expect } from 'vitest';

import LogTransformStream from './LogTransformStream.js';

describe('LogTransformStream', () => {
	it('should be an instance of TransformStream', () => {
		const stream = new LogTransformStream();

		expect(stream).toBeInstanceOf(TransformStream);
	});
});
