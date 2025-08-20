import { describe, it, expect, beforeEach } from 'vitest';

import * as object from './index.js';

// > Test Data

const primitiveData = {
	string: 'hello',
	number: 42,
	boolean: true,
	nullValue: null,
	undefinedValue: undefined
};

const nestedData = {
	name: 'John',
	age: 30,
	profile: {
		bio: 'Developer',
		settings: {
			theme: 'dark',
			notifications: true
		}
	},
	tags: ['javascript', 'nodejs'],
	contacts: {
		email: 'john@example.com',
		social: {
			twitter: '@john'
		}
	}
};

const mixedArray = [
	'primitive',
	42,
	{ name: 'object' },
	['nested', 'array'],
	true
];

// > Tests

describe('isEmpty', () => {
	it('should return true for empty objects', () => {
		expect(object.isEmpty({})).toBe(true);
		expect(object.isEmpty([])).toBe(true);
	});

	it('should return true for falsy values', () => {
		expect(object.isEmpty(null)).toBe(true);
		expect(object.isEmpty(undefined)).toBe(true);
		expect(object.isEmpty(false)).toBe(true);
		expect(object.isEmpty(0)).toBe(true);
		expect(object.isEmpty('')).toBe(true);
	});

	it('should return false for non-empty objects', () => {
		expect(object.isEmpty({ a: 1 })).toBe(false);
		expect(object.isEmpty([1, 2, 3])).toBe(false);
		expect(object.isEmpty(primitiveData)).toBe(false);
	});
});

describe('size', () => {
	it('should return correct size for objects', () => {
		expect(object.size({})).toBe(0);
		expect(object.size({ a: 1 })).toBe(1);
		expect(object.size({ a: 1, b: 2, c: 3 })).toBe(3);
		expect(object.size(primitiveData)).toBe(5);
	});

	it('should return correct size for arrays', () => {
		expect(object.size([])).toBe(0);
		expect(object.size([1, 2, 3])).toBe(3);
		expect(object.size(mixedArray)).toBe(5);
	});

	it('should not count inherited properties', () => {
		const obj = Object.create({ inherited: 'value' });
		obj.own = 'property';
		expect(object.size(obj)).toBe(1);
	});
});

describe('exportNotNullish', () => {
	it('should remove null and undefined properties', () => {
		const input = {
			keep: 'value',
			removeNull: null,
			removeUndefined: undefined,
			keepZero: 0,
			keepFalse: false,
			keepEmptyString: ''
		};

		const result = object.exportNotNullish(input);

		expect(result).toEqual({
			keep: 'value',
			keepZero: 0,
			keepFalse: false,
			keepEmptyString: ''
		});
	});

	it('should filter by onlyKeys when provided', () => {
		const input = {
			a: 'keep',
			b: 'remove',
			c: null,
			d: 'keep'
		};

		const result = object.exportNotNullish(input, ['a', 'd']);

		expect(result).toEqual({
			a: 'keep',
			d: 'keep'
		});
	});

	it('should handle empty objects', () => {
		expect(object.exportNotNullish({})).toEqual({});
		expect(object.exportNotNullish({}, [])).toEqual({});
	});
});

describe('exportPublic', () => {
	it('should remove properties starting with underscore', () => {
		const input = {
			public: 'keep',
			_private: 'remove',
			__internal: 'remove',
			normal: 'keep'
		};

		const result = object.exportPublic(input);

		expect(result).toEqual({
			public: 'keep',
			normal: 'keep'
		});
	});

	it('should keep specified private keys as read-only', () => {
		const input = {
			public: 'keep',
			_id: 'keep-readonly',
			_secret: 'remove',
			normal: 'keep'
		};

		const result = object.exportPublic(input, ['_id']);

		expect(result).toEqual({
			public: 'keep',
			_id: 'keep-readonly',
			normal: 'keep'
		});

		// Check that _id is read-only
		const descriptor = Object.getOwnPropertyDescriptor(result, '_id');
		expect(descriptor.writable).toBe(false);
		expect(descriptor.enumerable).toBe(true);
	});
});

describe('exportNotNested', () => {
	it('should keep only primitive values from objects', () => {
		const input = {
			name: 'John',
			age: 30,
			profile: { bio: 'Developer' },
			tags: ['js', 'node'],
			active: true
		};

		const result = object.exportNotNested(input);

		expect(result).toEqual({
			name: 'John',
			age: 30,
			active: true
		});
	});

	it('should keep only primitive values from arrays', () => {
		const result = object.exportNotNested(mixedArray);

		expect(result).toEqual(['primitive', 42, true]);
	});

	it('should return same object if already contains only primitives', () => {
		const input = { a: 1, b: 'string', c: true };
		const result = object.exportNotNested(input);

		expect(result).toBe(input); // Same reference for optimization
	});

	it('should handle empty objects and arrays', () => {
		expect(object.exportNotNested({})).toEqual({});
		expect(object.exportNotNested([])).toEqual([]);
	});
});

describe('keep', () => {
	let testObj;

	beforeEach(() => {
		testObj = {
			a: 1,
			b: 2,
			c: 3,
			d: null,
			e: undefined
		};
	});

	it('should keep only specified keys', () => {
		object.keep(testObj, ['a', 'c']);

		expect(testObj).toEqual({
			a: 1,
			c: 3
		});
	});

	it('should remove null and undefined by default', () => {
		object.keep(testObj, ['a', 'd', 'e']);

		expect(testObj).toEqual({
			a: 1
		});
	});

	it('should keep null and undefined when removeNullAndUndefined=false', () => {
		object.keep(testObj, ['a', 'd', 'e'], false);

		expect(testObj).toEqual({
			a: 1,
			d: null,
			e: undefined
		});
	});
});

describe('deepFreeze', () => {
	it('should freeze object and nested objects', () => {
		const obj = {
			a: 1,
			nested: {
				b: 2,
				deeper: {
					c: 3
				}
			},
			array: [1, { d: 4 }]
		};

		const frozen = object.deepFreeze(obj);

		expect(Object.isFrozen(frozen)).toBe(true);
		expect(Object.isFrozen(frozen.nested)).toBe(true);
		expect(Object.isFrozen(frozen.nested.deeper)).toBe(true);
		expect(Object.isFrozen(frozen.array)).toBe(true);
		expect(Object.isFrozen(frozen.array[1])).toBe(true);
	});

	it('should handle circular references', () => {
		const obj = { a: 1 };
		obj.self = obj;

		expect(() => object.deepFreeze(obj)).not.toThrow();
		expect(Object.isFrozen(obj)).toBe(true);
	});

	it('should freeze primitive values (no-op)', () => {
		expect(object.deepFreeze('string')).toBe('string');
		expect(object.deepFreeze(42)).toBe(42);
		expect(object.deepFreeze(null)).toBe(null);
	});
});

describe('objectSet', () => {
	it('should set values at simple paths', () => {
		const obj = {};
		object.objectSet(obj, 'name', 'John');

		expect(obj).toEqual({ name: 'John' });
	});

	it('should set values at nested paths', () => {
		const obj = {};
		object.objectSet(obj, 'user.profile.name', 'John');

		expect(obj).toEqual({
			user: {
				profile: {
					name: 'John'
				}
			}
		});
	});

	it('should set values using array paths', () => {
		const obj = {};
		object.objectSet(obj, ['user', 'profile', 'name'], 'John');

		expect(obj).toEqual({
			user: {
				profile: {
					name: 'John'
				}
			}
		});
	});

	it('should set array indices', () => {
		const obj = {};
		object.objectSet(obj, 'items.0.name', 'First');
		object.objectSet(obj, 'items.1.name', 'Second');

		// objectSet creates objects, not arrays when using numeric keys
		expect(obj).toEqual({
			items: {
				'0': { name: 'First' },
				'1': { name: 'Second' }
			}
		});
	});

	it('should overwrite existing values', () => {
		const obj = { user: { name: 'Old' } };
		object.objectSet(obj, 'user.name', 'New');

		expect(obj.user.name).toBe('New');
	});
});

describe('deletePath', () => {
	it('should delete simple properties', () => {
		const obj = { a: 1, b: 2 };
		object.deletePath(obj, 'a');

		expect(obj).toEqual({ b: 2 });
	});

	it('should delete nested properties', () => {
		const obj = {
			user: {
				profile: {
					name: 'John',
					age: 30
				}
			}
		};

		object.deletePath(obj, 'user.profile.name');

		expect(obj).toEqual({
			user: {
				profile: {
					age: 30
				}
			}
		});
	});

	it('should delete array elements', () => {
		const obj = {
			items: ['a', 'b', 'c']
		};

		object.deletePath(obj, 'items.1');

		// deletePath removes the element, shortening the array
		expect(obj.items).toEqual(['a', 'c']);
	});

	it('should handle non-existent paths gracefully', () => {
		const obj = { a: 1 };

		expect(() => object.deletePath(obj, 'nonexistent')).not.toThrow();
		expect(() => object.deletePath(obj, 'a.b.c')).not.toThrow();
	});
});

describe('objectGet', () => {
	it('should get simple properties', () => {
		const obj = { name: 'John' };

		expect(object.objectGet(obj, 'name')).toBe('John');
	});

	it('should get nested properties', () => {
		expect(object.objectGet(nestedData, 'profile.bio')).toBe('Developer');
		expect(object.objectGet(nestedData, 'profile.settings.theme')).toBe('dark');
	});

	it('should get array elements', () => {
		expect(object.objectGet(nestedData, 'tags.0')).toBe('javascript');
		expect(object.objectGet(nestedData, 'tags.1')).toBe('nodejs');
	});

	it('should return default value for non-existent paths', () => {
		expect(object.objectGet(nestedData, 'nonexistent', 'default')).toBe('default');
		expect(object.objectGet(nestedData, 'profile.nonexistent', 'default')).toBe('default');
	});

	it('should return undefined for non-existent paths without default', () => {
		expect(object.objectGet(nestedData, 'nonexistent')).toBe(undefined);
	});

	it('should handle array paths', () => {
		expect(object.objectGet(nestedData, ['profile', 'bio'])).toBe('Developer');
	});
});

describe('objectGetWithThrow', () => {
	it('should return value when path exists', () => {
		expect(object.objectGetWithThrow(nestedData, 'name')).toBe('John');
	});

	it('should throw when path does not exist', () => {
		expect(() => object.objectGetWithThrow(nestedData, 'nonexistent'))
			.toThrowError('No value found at path [nonexistent]');
	});

	it('should apply parse function when provided', () => {
		const parseFn = (value) => {
			if (typeof value !== 'string') {
				return { error: new Error('Expected string') };
			}
			return { value: value.toUpperCase() };
		};

		expect(object.objectGetWithThrow(nestedData, 'name', parseFn)).toBe('JOHN');
	});

	it('should throw when parse function returns error', () => {
		const parseFn = () => ({ error: new Error('Parse error') });

		expect(() => object.objectGetWithThrow(nestedData, 'name', parseFn))
			.toThrowError('Invalid value found at path [name]');
	});
});

describe('clone', () => {
	it('should return same reference for primitives', () => {
		expect(object.clone('string')).toBe('string');
		expect(object.clone(42)).toBe(42);
		expect(object.clone(true)).toBe(true);
		expect(object.clone(null)).toBe(null);
	});

	it('should deep clone objects', () => {
		const cloned = object.clone(nestedData);

		expect(cloned).toEqual(nestedData);
		expect(cloned).not.toBe(nestedData);
		expect(cloned.profile).not.toBe(nestedData.profile);
		expect(cloned.profile.settings).not.toBe(nestedData.profile.settings);
	});

	it('should deep clone arrays', () => {
		const original = [1, { a: 2 }, [3, 4]];
		const cloned = object.clone(original);

		expect(cloned).toEqual(original);
		expect(cloned).not.toBe(original);
		expect(cloned[1]).not.toBe(original[1]);
		expect(cloned[2]).not.toBe(original[2]);
	});

	it('should handle circular references', () => {
		const obj = { a: 1 };
		obj.self = obj;

		const cloned = object.clone(obj);

		expect(cloned.a).toBe(1);
		expect(cloned.self).toBe(cloned);
		expect(cloned).not.toBe(obj);
	});
});


describe('getTree', () => {
	const sourceObj = {
		name: 'John',
		age: 30,
		profile: {
			bio: 'Developer',
			avatar: 'avatar.jpg',
			settings: {
				theme: 'dark',
				notifications: true
			},
			tags: ['js', 'node']
		},
		contacts: {
			email: 'john@example.com',
			phone: '123-456-7890'
		}
	};

	it('should extract simple paths', () => {
		const tree = {
			name: 1,
			age: 1
		};

		const result = object.getTree(sourceObj, tree);

		expect(result).toEqual({
			name: 'John',
			age: 30
		});
	});

	it('should extract nested paths', () => {
		const tree = {
			'profile.bio': 1,
			'contacts.email': 1
		};

		const result = object.getTree(sourceObj, tree);

		expect(result).toEqual({
			profile: {
				bio: 'Developer'
			},
			contacts: {
				email: 'john@example.com'
			}
		});
	});

	it('should extract full objects', () => {
		const tree = {
			profile: 1
		};

		const result = object.getTree(sourceObj, tree);

		expect(result.profile).toEqual(sourceObj.profile);
	});

	it('should apply shallowLeaves option', () => {
		const tree = {
			profile: 1
		};

		const result = object.getTree(sourceObj, tree, { shallowLeaves: true });

		expect(result.profile).toEqual({
			bio: 'Developer',
			avatar: 'avatar.jpg'
			// settings and tags removed (nested objects/arrays)
		});
	});

	it('should handle simple tree structures', () => {
		const sourceObj = {
			name: 'John',
			profile: { bio: 'Dev' },
			email: 'john@test.com'
		};

		const tree = {
			name: 1,
			'profile.bio': 1,
			email: 1
		};

		const result = object.getTree(sourceObj, tree);

		expect(result).toEqual({
			name: 'John',
			profile: {
				bio: 'Dev'
			},
			email: 'john@test.com'
		});
	});
});

describe('extend', () => {
	it('should extend target with source properties via prototype', () => {
		const target = { a: 1 };
		const source = { b: 2, c: 3 };

		object.extend(target, source);

		expect(target.a).toBe(1);
		expect(target.b).toBe(2); // Via prototype
		expect(target.c).toBe(3); // Via prototype
	});

	it('should handle prototype extension', () => {
		const target = { a: 1 };
		const source = { b: 2 };

		object.extend(target, source);

		// Source properties should be available
		expect('b' in target).toBe(true);
		expect(target.b).toBe(2);
		// Properties are copied to target object
		expect(target.hasOwnProperty('b')).toBe(true);
	});
});

describe('updateObject', () => {
	it('should update object with new values', () => {
		const original = { a: 1, b: 2 };
		const updates = { b: 'updated', c: 'new' };

		const result = object.updateObject(original, updates);

		expect(result).toEqual({ a: 1, b: 'updated', c: 'new' });
		expect(result).toBe(original); // Mutates original object
	});

	it('should handle nested updates', () => {
		const original = { user: { name: 'John' } };
		const updates = { 'user.age': 30 };

		const result = object.updateObject(original, updates);

		expect(result).toEqual({
			user: {
				name: 'John',
				age: 30
			}
		});
	});

	it('should handle empty input object', () => {
		const original = {};
		const updates = { a: 1 };

		const result = object.updateObject(original, updates);

		expect(result).toEqual({ a: 1 });
	});
});

describe('copyOwnProperties', () => {
	it('should copy enumerable properties', () => {
		const from = { a: 1, b: 2 };
		const to = { c: 3 };

		object.copyOwnProperties(from, to);

		expect(to).toEqual({ a: 1, b: 2, c: 3 });
	});

	it('should preserve property descriptors', () => {
		const from = {};
		Object.defineProperty(from, 'readonly', {
			value: 'test',
			writable: false,
			enumerable: true
		});

		const to = {};
		object.copyOwnProperties(from, to);

		const descriptor = Object.getOwnPropertyDescriptor(to, 'readonly');
		expect(descriptor.writable).toBe(false);
		expect(descriptor.value).toBe('test');
	});
});

describe('objectDiff', () => {
	it('should detect added properties', () => {
		const before = { a: 1 };
		const after = { a: 1, b: 2 };

		const changes = object.objectDiff(before, after);

		expect(changes).toContainEqual({
			path: 'b',
			set: 2
		});
	});

	it('should detect updated properties', () => {
		const before = { a: 1, b: 2 };  
		const after = { a: 1, b: 'updated' };

		const changes = object.objectDiff(before, after);

		expect(changes).toContainEqual({
			path: 'b',
			set: 'updated'
		});
	});

	it('should detect deleted properties', () => {
		const before = { a: 1, b: 2 };
		const after = { a: 1, b: null }; // deleteValue defaults to null

		const changes = object.objectDiff(before, after);

		expect(changes).toContainEqual({
			path: 'b',
			unset: 1
		});
	});

	it('should handle nested objects', () => {
		const before = { user: { name: 'John' } };
		const after = { user: { name: 'Jane', age: 30 } };

		const changes = object.objectDiff(before, after);

		expect(changes).toContainEqual({
			path: 'user',
			set: { name: 'Jane', age: 30 }
		});
	});
});

describe('patchObject', () => {
	it('should apply add changes', () => {
		const obj = { a: 1 };
		const changes = [
			{ path: 'b', set: 2 }
		];

		object.patchObject(obj, changes);

		expect(obj).toEqual({ a: 1, b: 2 });
	});

	it('should apply update changes', () => {
		const obj = { a: 1, b: 2 };
		const changes = [
			{ path: 'b', set: 'updated' }
		];

		object.patchObject(obj, changes);

		expect(obj).toEqual({ a: 1, b: 'updated' });
	});

	it('should apply delete changes', () => {
		const obj = { a: 1, b: 2 };
		const changes = [
			{ path: 'b', unset: 1 }
		];

		object.patchObject(obj, changes);

		expect(obj).toEqual({ a: 1 });
	});

	it('should handle nested changes', () => {
		const obj = { user: { name: 'John' } };
		const changes = [
			{ path: 'user.age', set: 30 }
		];

		object.patchObject(obj, changes);

		expect(obj).toEqual({
			user: {
				name: 'John',
				age: 30
			}
		});
	});
});

describe('setReadOnlyProperty', () => {
	it('should set read-only property', () => {
		const obj = {};

		object.setReadOnlyProperty(obj, 'readonly', 'value');

		expect(obj.readonly).toBe('value');

		const descriptor = Object.getOwnPropertyDescriptor(obj, 'readonly');
		expect(descriptor.writable).toBe(false);
		expect(descriptor.enumerable).toBe(true);
	});
});

describe('getPrototypeNames', () => {
	it('should get constructor names in prototype chain', () => {
		class TestClass {
			method1() {}
			method2() {}
		}

		const instance = new TestClass();
		const names = object.getPrototypeNames(instance);

		expect(names).toContain('TestClass');
		expect(names).toContain('Object');
	});

	it('should handle plain objects', () => {
		const obj = { a: 1 };
		const names = object.getPrototypeNames(obj);

		expect(names).toContain('Object');
	});
});
