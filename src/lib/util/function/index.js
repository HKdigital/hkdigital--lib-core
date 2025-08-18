/**
 * function.js
 *
 * @description
 * This file contains code for working with functions
 *
 * @example
 *
 *   import { once } from "./function.js";
 *
 *   const sayHelloOnce = once( () => { console.log("Hello"); } );
 *
 *   sayHelloOnce();
 *   sayHelloOnce();
 *
 * @example
 *
 *   import { defer } from './process.js';
 *
 *   defer( () => {
 *     console.log("The execution of the function has been defered");
 *   } );
 */

/* ------------------------------------------------------------------ Imports */

import * as expect from '../expect.js';

/* ---------------------------------------------------------------- Internals */

const NEXT_TICK_MESSAGE = 'hk-next-tick';

/**
 * Detect and return the most suitable setImmediate implementation available
 * on the current platform
 */
function set_immediate_implementation() {
	if (typeof global !== 'undefined') {
		if (undefined !== global.setImmediate) {
			return global.setImmediate;
		}
	} else if (typeof window !== 'undefined') {
		if (window.postMessage && window.addEventListener) {
			const queue = [];

			window.addEventListener(
				'message',
				(event) => {
					const source = event.source;

					if ((source === window || source === null) && event.data === NEXT_TICK_MESSAGE) {
						event.stopPropagation();
						if (queue.length > 0) {
							const fn = queue.shift();
							fn();
						}
					}
				},
				true
			);

			return function nextTickUsingPostMessage(fn) {
				expect.function(fn);

				queue.push(fn);
				window.postMessage(NEXT_TICK_MESSAGE, '*');
			};
		}
	}

	throw new Error('No suitable [setImmediate] implementation available');
}

/* ------------------------------------------------------------------ Exports */

/**
 * 'No operation' function
 * - A function that does nothing
 */
export const noop = () => {};

// -----------------------------------------------------------------------------

/**
 * Wraps a function so that the callback function will be called only once
 *
 * @param {function} callback
 *
 * @returns {function} callback wrapped in `once` function
 */
export function once(callback) {
	expect.function(callback);

	let ignore = false;

	return function () {
		if (!ignore) {
			ignore = true;
			callback(...arguments);
		}
	};
}

// -----------------------------------------------------------------------------

/**
 * Returns a debounced function
 * - The original function is not called more than once during the
 *   specified interval
 *
 * @param {function} fn
 * @param {number} [intervalMs=200]
 *
 * @returns {function} debounced function
 */
export function debounce(fn, intervalMs = 200) {
	let idleTimer;
	let lastArguments;

	// console.log("debounce");

	return function debounced() {
		// console.log("debounced");

		if (idleTimer) {
			// console.log("idleTimer running");

			// The function has been called recently
			lastArguments = arguments;
			return;
		}

		idleTimer = setTimeout(() => {
			// console.log("idleTimer finished", lastArguments);

			idleTimer = null;

			if (lastArguments) {
				//
				// At least one call has been "debounced"
				// -> make call with last arguments, so function always receives
				//    the arguments of the last call to the function
				//
				fn(...lastArguments);
				lastArguments = undefined;
			}
		}, intervalMs);

		fn(...arguments);
	};
}

// -----------------------------------------------------------------------------

/**
 * Defer the execution of a function
 *  - Uses the best 'setImmediate' implementation supported by the current
 *    runtime environment
 *
 * @param {function} fn - Function to execute
 *
 * --
 *
 * @note setImmediate is preferred over nextTick
 *
 * @see https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
 */
export const defer = set_immediate_implementation();

// -----------------------------------------------------------------------------

/**
 * Adds a wrapper around a function that only calls the supplied function
 * if the (first) supplied argument to the returned function is not `null`
 *
 * @param {object} [object]
 *   Optional function context to be used as `this`
 *
 * @param {function} functionOrMethodName
 *
 * @returns {function} not null wrapper function
 */
// export function ifNotNull( /* object, functionOrMethodName */ )
// {
//   let fn;

//   switch( arguments.length )
//   {
//     case 1:
//       fn = arguments[0];
//       expectFunction( fn, "Missing or invalid parameter [fn]" );
//       break;

//     case 2:
//       {
//         const object = arguments[0];
//         const methodName = arguments[1];

//         expectObject( object, "Invalid parameter [object]" );
//         expectNotEmptyString( methodName, "Invalid parameter [methodName]" );

//         fn = object[ methodName ].bind( object );

//         expectFunction( fn, `Invalid method [<object>.${methodName}]` );
//       }
//       break;

//     default:
//       throw new Error("Invalid number of arguments");
//   }

//   return async ( value ) => {
//     if( null !== value )
//     {
//       await fn( value );
//     }
//   };
// }
