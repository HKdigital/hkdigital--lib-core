import { describe, it, expect, vi } from 'vitest';

import { HkPromise } from './index.js';
import { PromiseError } from '$lib/errors/promise.js';

describe('HkPromise - Basic functionality', () => {
	it('should be a Promise', () => {
		const promise = new HkPromise();

		expect(promise).toBeInstanceOf(Promise);
	});

	it('should extend Promise functionality', () => {
		const promise = new HkPromise();

		expect(typeof promise.then).toBe('function');
		expect(typeof promise.catch).toBe('function');
		expect(typeof promise.resolve).toBe('function');
		expect(typeof promise.reject).toBe('function');

		expect(promise.pending).toBe(true);
		expect(promise.resolved).toBe(false);
		expect(promise.rejected).toBe(false);
		expect(promise.cancelled).toBe(false);
		expect(promise.timeout).toBe(false);
	});
});

describe('HkPromise - State management', () => {
	it('should resolve correctly', async () => {
		const promise = new HkPromise();
		const value = 'test value';

		promise.resolve(value);

		expect(promise.pending).toBe(false);
		expect(promise.resolved).toBe(true);
		expect(promise.rejected).toBe(false);

		const result = await promise;
		expect(result).toBe(value);
	});

	it('should reject correctly', async () => {
		const promise = new HkPromise();
		const error = new Error('test error');

		promise.reject(error);

		expect(promise.pending).toBe(false);
		expect(promise.resolved).toBe(false);
		expect(promise.rejected).toBe(true);

		try {
			await promise;
		} catch (e) {
			expect(e).toBe(error);
		}
	});

	it('should prevent double resolution', () => {
		const promise = new HkPromise();

		promise.resolve('first');

		expect(() => {
			promise.resolve('second');
		}).toThrow('Cannot resolve Promise. Promise has already resolved');
	});

	it('should prevent double rejection', () => {
		const promise = new HkPromise();

		promise.reject(new Error('first'));

		expect(() => {
			promise.reject(new Error('second'));
		}).toThrow('Cannot reject Promise. Promise has already been rejected');
	});

	it('should prevent resolving after rejection', () => {
		const promise = new HkPromise();

		promise.reject(new Error('rejected'));

		expect(() => {
			promise.resolve('value');
		}).toThrow('Cannot resolve Promise. Promise has already been rejected');
	});

	it('should prevent rejecting after resolution', () => {
		const promise = new HkPromise();

		promise.resolve('value');

		expect(() => {
			promise.reject(new Error('error'));
		}).toThrow('Cannot reject Promise. Promise has already resolved');
	});
});

describe('HkPromise - Try methods', () => {
	it('should tryResolve only when pending', async () => {
		const promise = new HkPromise();

		promise.resolve('first');
		promise.tryResolve('second'); // Should not throw

		const result = await promise;
		expect(result).toBe('first');
	});

	it('should tryReject only when pending', async () => {
		const promise = new HkPromise();

		promise.resolve('value');
		promise.tryReject(new Error('error')); // Should not throw

		const result = await promise;
		expect(result).toBe('value');
	});
});

describe('HkPromise - Cancellation', () => {
	it('should cancel with default error', async () => {
		const promise = new HkPromise();

		promise.cancel();

		expect(promise.pending).toBe(false);
		expect(promise.rejected).toBe(true);
		expect(promise.cancelled).toBe(true);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.message).toBe('Cancelled');
			expect(error.cancelled).toBe(true);
			expect(error.timeout).toBe(false);
			expect(error.cause).toBeUndefined();
		}
	});

	it('should cancel with custom error (Error instance)', async () => {
		const promise = new HkPromise();
		const customError = new Error('Custom cancellation');

		promise.cancel(customError);

		expect(promise.cancelled).toBe(true);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.message).toBe('Custom cancellation');
			expect(error.cancelled).toBe(true);
			expect(error.timeout).toBe(false);
			expect(error.cause).toBe(customError);
			expect(error.details).toBeUndefined();
		}
	});

	it('should tryCancel only when pending', () => {
		const promise = new HkPromise();

		promise.resolve('value');
		promise.tryCancel(); // Should not throw

		expect(promise.cancelled).toBe(false);
	});

	it('should cancel with details object', async () => {
		const promise = new HkPromise();
		const details = { reason: 'user_requested', userId: 123 };

		promise.cancel(details);

		expect(promise.cancelled).toBe(true);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.message).toBe('Cancelled');
			expect(error.cancelled).toBe(true);
			expect(error.timeout).toBe(false);
			expect(error.cause).toBeUndefined();
			expect(error.details).toBe(details);
		}
	});

	it('should cancel with string details', async () => {
		const promise = new HkPromise();

		promise.cancel('string cancellation');

		expect(promise.cancelled).toBe(true);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.message).toBe('Cancelled');
			expect(error.cancelled).toBe(true);
			expect(error.timeout).toBe(false);
			expect(error.cause).toBeUndefined();
			expect(error.details).toBe('string cancellation');
		}
	});
});

describe('HkPromise - PromiseError properties', () => {
	it('should create PromiseError with correct properties for timeout', async () => {
		vi.useFakeTimers();

		const promise = new HkPromise();
		promise.setTimeout(1000, 'Test timeout');

		vi.advanceTimersByTime(1000);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.name).toBe('PromiseError');
			expect(error.message).toBe('Test timeout');
			expect(error.timeout).toBe(true);
			expect(error.cancelled).toBe(true);
			expect(error.cause).toBeUndefined();
			expect(error.details).toBeUndefined();
		}

		vi.useRealTimers();
	});
});

describe('HkPromise - Timeout functionality', () => {
	it('should timeout correctly', async () => {
		vi.useFakeTimers();

		const promise = new HkPromise();
		promise.setTimeout(1000, 'Custom timeout message');

		vi.advanceTimersByTime(1000);

		expect(promise.pending).toBe(false);
		expect(promise.rejected).toBe(true);
		expect(promise.cancelled).toBe(true);
		expect(promise.timeout).toBe(true);

		try {
			await promise;
		} catch (error) {
			expect(error).toBeInstanceOf(PromiseError);
			expect(error.message).toBe('Custom timeout message');
			expect(error.timeout).toBe(true);
			expect(error.cancelled).toBe(true);
		}

		vi.useRealTimers();
	});

	it('should clear timeout on resolve', () => {
		vi.useFakeTimers();

		const promise = new HkPromise();
		promise.setTimeout(1000);

		// Resolve before timeout
		promise.resolve('resolved');

		vi.advanceTimersByTime(1000);

		expect(promise.resolved).toBe(true);
		expect(promise.timeout).toBe(false);

		vi.useRealTimers();
	});

	it('should clear timeout on reject', () => {
		vi.useFakeTimers();

		const promise = new HkPromise();
		promise.setTimeout(1000);

		// Reject before timeout
		promise.reject(new Error('rejected'));

		vi.advanceTimersByTime(1000);

		expect(promise.rejected).toBe(true);
		expect(promise.timeout).toBe(false);

		vi.useRealTimers();
	});

	it('should prevent setting timeout on resolved promise', () => {
		const promise = new HkPromise();
		promise.resolve('value');

		expect(() => {
			promise.setTimeout(1000);
		}).toThrow('Cannot set timeout. Promise has already resolved');
	});

	it('should prevent setting timeout on rejected promise', () => {
		const promise = new HkPromise();
		promise.reject(new Error('error'));

		expect(() => {
			promise.setTimeout(1000);
		}).toThrow('Cannot set timeout. Promise has already been rejected');
	});

	it('should replace existing timeout', () => {
		vi.useFakeTimers();

		const promise = new HkPromise();
		promise.setTimeout(1000, 'First timeout');
		promise.setTimeout(500, 'Second timeout');

		vi.advanceTimersByTime(500);

		expect(promise.timeout).toBe(true);

		vi.useRealTimers();
	});
});

describe('HkPromise - Constructor with initFn', () => {
	it('should work with init function', async () => {
		const promise = new HkPromise((resolve, reject) => {
			setTimeout(() => resolve('init value'), 10);
		});

		const result = await promise;
		expect(result).toBe('init value');
	});

	it('should work with rejecting init function', async () => {
		const promise = new HkPromise((resolve, reject) => {
			setTimeout(() => reject(new Error('init error')), 10);
		});

		try {
			await promise;
		} catch (error) {
			expect(error.message).toBe('init error');
		}
	});
});

describe('HkPromise - Arguments forwarding', () => {
	it('should forward multiple arguments to resolve', async () => {
		const promise = new HkPromise();

		promise.resolve('first', 'second', 'third');

		// Note: Promise.resolve only takes the first argument
		const result = await promise;
		expect(result).toBe('first');
	});

	it('should forward multiple arguments to reject', async () => {
		const promise = new HkPromise();
		const error = new Error('test');

		promise.reject(error, 'extra', 'args');

		try {
			await promise;
		} catch (e) {
			expect(e).toBe(error);
		}
	});
});
