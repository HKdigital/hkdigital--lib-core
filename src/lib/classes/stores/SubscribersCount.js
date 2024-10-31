import { writable, get } from 'svelte/store';

/**
 * Class that can be used to add a `SubscribersCount` store to classes
 * or other objects
 */
export default class SubscribersCount {
	#count;

	constructor() {
		this.#count = writable(0);
	}

	increment() {
		this.#count.update((value) => value + 1);
	}

	decrement() {
		this.#count.update((value) => value - 1);
	}

	/**
	 * Subscribe to `SubscribersCount` store
	 *
	 * @param {(value:number)=>void} fn
	 *
	 * @returns {()=>void} unsubscribe
	 */
	subscribe(fn) {
		return this.#count.subscribe(fn);
	}

	/**
	 * Subscribe to `SubscribersCount` store and receive an update once if the
	 * count is zero.
	 *
	 * @param {(value:number)=>void} fn
	 *
	 * @returns {()=>void} unsubscribe
	 */
	onceEmpty(fn) {
		let unsubscribe = this.#count.subscribe((value) => {
			if (value === 0) {
				unsubscribe();
				fn(value);
			}
		});

		return unsubscribe;
	}

	/**
	 * Create a writable store with added 'subscribeCount' functionality
	 */
	static writable() {
		const store = writable(...arguments);

		return SubscribersCount.wrap(store);
	}

	/**
	 * Add subscriber count functionality to an existing store by wrapping
	 * the store with a Proxy
	 *
	 * @template T;
	 *
	 * @param {import('svelte/store').Writable<T>} store
	 */
	static wrap(store) {
		// expect.store( store );

		const counter = new SubscribersCount();

		const handler = {
			/**
			 * @param {*} target
			 * @param {string} prop
			 */
			get(target, prop) {
				switch (prop) {
					case 'subscribe': {
						return /* subscribe */ function () {
							counter.increment();
							const unsubscribe = target[prop](...arguments);

							return /* unsubscribe */ () => {
								counter.decrement();
								unsubscribe();
							};
						};
					}

					case 'value':
						return get(store);

					case 'subscribersCount':
						return counter;
				}

				return Reflect.get(target, prop);
				// return target[prop];
			}
		};

		return new Proxy(store, handler);
	}
}
