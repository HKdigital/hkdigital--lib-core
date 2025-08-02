/**
 * HkPromise.js
 *
 * @description
 * HkPromise extends the default Promise class with external control methods
 * and timeout/cancellation support. Perfect for scenarios where you need to
 * resolve/reject a promise from outside its constructor.
 *
 * @example
 * // Basic external control
 * const promise = new HkPromise();
 * setTimeout(() => promise.resolve('done'), 1000);
 * const result = await promise; // 'done'
 *
 * @example
 * // Timeout support
 * const promise = new HkPromise()
 *   .setTimeout(5000, 'Operation timed out');
 * // Promise auto-rejects after 5 seconds
 *
 * @example
 * // Cancellation with details
 * const promise = new HkPromise();
 * promise.cancel({ reason: 'user_cancelled', userId: 123 });
 * // Creates PromiseError with details property
 *
 * @example
 * // State inspection
 * const promise = new HkPromise();
 * console.log(promise.pending); // true
 * promise.resolve('success');
 * console.log(promise.resolved); // true
 */

/* ------------------------------------------------------------------ Imports */

import * as expect from '$lib/util/expect/index.js';

import { noop } from '$lib/util/function/index.js';

import { PromiseError } from '$lib/errors/promise.js';

/* ---------------------------------------------------------------- Internals */

/* ------------------------------------------------------------------- Export */

/**
 * HkPromise extends the default javascript Promise class
 * - Exposes methods to interact with the state of the
 *   promise, such as 'resolve' and 'reject'
 */
export default class HkPromise extends Promise {
	// Private fields using modern JavaScript syntax
	#resolveFn;
	#rejectFn;
	#pending = true;
	#resolved = false;
	#rejected = false;
	#cancelled = false;
	#timeout = false;
	#timeoutTimer;
	#hasThen = false;

	/**
	 * @param {(resolveFn?:function, rejectFn?:function)=>void} [initFn]
	 */
	constructor(initFn) {
		let _resolveFn;
		let _rejectFn;

		super((resolveFn, rejectFn) => {
			//
			// @note if initFn cannot be called an exception will be thrown:
			// TypeError: Promise resolve or reject function is not callable
			//
			if (initFn) {
				initFn(resolveFn, rejectFn);
			}

			_resolveFn = resolveFn;
			_rejectFn = rejectFn;
		});

		// Store resolve and reject functions
		this.#resolveFn = _resolveFn;
		this.#rejectFn = _rejectFn;
	}

	/**
	 * Get value of property [resolved]
	 *
	 * @returns {boolean} true if the promise has been resolved
	 */
	get resolved() {
		return this.#resolved;
	}

	/**
	 * Get value of property [rejected]
	 *
	 * @returns {boolean} true if the promise was rejected
	 */
	get rejected() {
		return this.#rejected;
	}

	/**
	 * Get value of property [pending]
	 *
	 * @returns {boolean} true if the promise is still pending
	 */
	get pending() {
		return this.#pending;
	}

	/**
	 * Get value of property [cancelled]
	 *
	 * @returns {boolean} true if the promise was cancelled
	 */
	get cancelled() {
		return this.#cancelled;
	}

	/**
	 * Get value of property [timeout]
	 *
	 * @returns {boolean} true if the promise was cancelled due to a timeout
	 */
	get timeout() {
		return this.#timeout;
	}

	/**
	 * Resolve the promise
	 *
	 * @param {...any} args - Values to pass to the "then" callbacks
	 *
	 * @returns {object} this
	 */
	resolve(...args) {
		// -- Check current Promise state

		if (!this.#pending) {
			if (this.#resolved) {
				throw new Error('Cannot resolve Promise. Promise has already resolved');
			} else {
				throw new Error(
					'Cannot resolve Promise. Promise has already been rejected'
				);
			}
		}

		// -- Clear timeout timer (if any)

		if (undefined !== this.#timeoutTimer) {
			clearTimeout(this.#timeoutTimer);

			this.#timeoutTimer = undefined;
		}

		// -- Set flags and call resolve function

		this.#resolved = true;
		this.#pending = false;

		this.#resolveFn(...args);

		return this;
	}

	// -------------------------------------------------------------------- Method

	/**
	 * Resolve the promise if the promise is still pending
	 *
	 * @param {...any} args - Values to pass to the "then" callbacks
	 *
	 * @returns {object} this
	 */
	tryResolve(...args) {
		if (this.#pending) {
			this.resolve(...args);
		}

		return this;
	}

	/**
	 * Reject the promise
	 *
	 * @param {...any} args
	 *   Objects to pass to the "catch" callbacks, usually an Error object or details
	 *
	 * @returns {object} this
	 */
	reject(...args) {
		if (!this.#hasThen) {
			//
			// No then (or await) has been used
			// add catch to prevent useless unhandled promise rejection
			//
			this.catch(noop);
		}

		// -- Check current Promise state

		if (!this.#pending) {
			if (this.#resolved) {
				throw new Error('Cannot reject Promise. Promise has already resolved');
			} else {
				throw new Error(
					'Cannot reject Promise. Promise has already been rejected'
				);
			}
		}

		// -- Clear timeout timer (if any)

		if (undefined !== this.#timeoutTimer) {
			clearTimeout(this.#timeoutTimer);

			this.#timeoutTimer = undefined;
		}

		// -- Set flags and call reject function

		this.#rejected = true;
		this.#pending = false;

		this.#rejectFn(...args);

		return this;
	}

	/**
	 * Reject the promise if the promise is still pending
	 *
	 * @param {...any} args
	 *   Objects to pass to the "catch" callbacks, usually an Error object or details
	 *
	 * @returns {object} this
	 */
	tryReject(...args) {
		if (this.#pending) {
			this.reject(...args);
		}

		return this;
	}

	/**
	 * Reject the promise and set this.cancelled=true
	 *
	 * @param {Error|*} [errorOrDetails]
	 *   Error object or details to pass to the "catch" callbacks
	 *
	 * @returns {object} this
	 */
	cancel(errorOrDetails) {
		let promiseError;

		if (errorOrDetails instanceof Error) {
			// If it's an Error, create error chain
			promiseError = new PromiseError(
				errorOrDetails.message,
				{
					cancelled: true,
					cause: errorOrDetails
				}
			);
		} else {
			// If it's details or undefined, use as details
			promiseError = new PromiseError(
				'Cancelled',
				{
					cancelled: true,
					details: errorOrDetails
				}
			);
		}

		this.#cancelled = true;
		this.reject(promiseError);

		return this;
	}

	/**
	 * Reject the promise and set this.cancelled=true if still pending
	 *
	 * @param {Error|*} [errorOrDetails]
	 *   Error object or details to pass to the "catch" callbacks
	 *
	 * @returns {object} this
	 */
	tryCancel(errorOrDetails) {
		if (this.#pending) {
			this.cancel(errorOrDetails);
		}

		return this;
	}

	/**
	 * Specify the number of milliseconds until the promise should time out.
	 * - When a timeout occurs: the promise is cancelled and the following
	 *   properties are both set
	 *
	 *      this.timeout=true
	 *      this.cancelled=true
	 *
	 * @param {number} ms
	 *   Number of milliseconds after which the promise should time out
	 *
	 * @param {string} [message="Timeout"]
	 *   Message of the error that will be thrown when the timeout occurs
	 */
	setTimeout(ms, message = 'Timeout') {
		expect.number(ms);
		expect.string(message);

		// -- Check current Promise state

		if (!this.#pending) {
			if (this.#resolved) {
				throw new Error('Cannot set timeout. Promise has already resolved');
			} else {
				throw new Error(
					'Cannot set timeout. Promise has already been rejected'
				);
			}
		}

		// -- Clear existing timeout (if any)

		if (undefined !== this.#timeoutTimer) {
			clearTimeout(this.#timeoutTimer);
		}

		// -- Set timeout

		this.#timeoutTimer = setTimeout(() => {
			if (!this.#pending) {
				// Promise has already been resolved (should not happen)
				return;
			}

			this.#timeout = true;
			this.#cancelled = true;

			const timeoutError = new PromiseError(message, {
				timeout: true,
				cancelled: true
			});

			this.reject(timeoutError);
		}, ms);

		// return this -> chainable method
		return this;
	}

	/**
	 * Register a callback that is called when the promise resolves
	 *
	 * @param {...any} args - Callback functions and options
	 */
	then(...args) {
		this.#hasThen = true;

		return super.then(...args);
	}

	/**
	 * Register a callback that is called when the promise rejects, is
	 * cancelled or times out
	 *
	 * @param {...any} args - Callback functions and options
	 */
	catch(...args) {
		return super.catch(...args);
	}
} // end class
