import { expect } from '../index.js';

const instancesByNeedle = new Map();

/**
 * Get a singleton instance
 * - A class can be supplied to create the singleton instance from
 * - The singleton is identified by a needle string
 *
 * @param {object} _
 * @param {any} _.class
 * @param {*[]} [_.args] - Constructor arguments
 * @param {string} [_.needle]
 *   If not supplied, a needle will be constructed from the serialized
 *   constructor arguments (args).
 */
export function getInstance({ needle, class: Class, args }) {
	expect.class(Class);

	if (!needle) {
		// Stringify instance arguments and use it as needle
		needle = JSON.stringify(args === undefined ? null : args);
	}

	expect.notEmptyString(needle);

	const className = Class.constructor.name;

	// console.log('getInstance()', { needle, args, className });

	needle = `${className}:${needle}`;

	let instance = instancesByNeedle.get(needle);

	if (!instance) {
		// console.log('Create new instance');
		// @ts-ignore
		instance = new Class(...(args ?? []));

		instancesByNeedle.set(needle, instance);
	}

	return instance;
}

/**
 * Creates a proxy that instantiates the singleton class upon it's first usage
 *
 * @template T
 *
 * @param {object} _
 * @param {new() => T} _.class
 * @param {*[]} [_.args] - Constructor arguments
 *
 * @returns {T & {init:()=>null}} proxy
 */
export function lazySingleton({ class: Class, args }) {
	/** @type {T} */
	let singleton;

	/** @type {T & {init:()=>null}} */
	// @ts-ignore
	const proxy = new Proxy(
		// @ts-ignore
		{},
		{
			/**
			 * @param {T} target
			 * @param {string} prop
			 */
			// @ts-ignore
			get(target, prop) {
				// console.log('lazySingleton: get property', prop);

				if (!singleton) {
					// @ts-ignore
					singleton = new Class(...(args ?? []));
				}

				if (prop === 'init') {
					// @ts-ignore
					if (prop in singleton) {
						// The class has an init method itself, return a reference
						return singleton[prop];
					}

					return () => null;
				}

				// @ts-ignore
				return singleton[prop];
			}
		}
	);

	return proxy;
}
