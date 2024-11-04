import { describe, it, expect } from 'vitest';

import { IterableTree } from './index.js';

describe('IterableTree', () => {
	it('should have iterable entries', () => {
		const data = { a: { b: 1 } };

		const tree = new IterableTree(data);

		const entries = Array.from(tree.entries());

		// Expect one entry for object path ['a', 'b'], value 1
		expect(entries).toStrictEqual([[['a', 'b'], 1]]);
	});
});
