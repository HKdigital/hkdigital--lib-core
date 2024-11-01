import { writable } from 'svelte/store';

// eslint-disable-next-line no-unused-vars
import * as Zods from '../../zod/all.js';

import SubscribersCount from '../stores/SubscribersCount.js';

// > Class

export default class ServerEventsStore {
	/** @type {Zods.AbsOrRelUrl} */
	#url;

	/** @type {import("svelte/store").Writable<object|null>} */
	#store;

	/** @type {boolean} */
	#starting = false;

	/** @type {ReadableStream<Uint8Array>|null} */
	#stream = null;

	/** @type {SubscribersCount} */
	subscribersCount;

	/**
	 * @param {object} _
	 * @param {Zods.AbsOrRelUrl} _.url
	 */
	constructor({ url }) {
		this.#url = Zods.AbsOrRelUrl.parse(url);

		this.#store = writable(null);

		this.subscribersCount = new SubscribersCount();
	}

	/**
	 * Subscribe to Server Send Events
	 *
	 * @param {import("svelte/store").Subscriber<object|null>} fn
	 *
	 * @returns {()=>void} unsubscribe
	 */
	subscribe(fn) {
		this.subscribersCount.increment();

		const unsubscribe = this.#store?.subscribe(fn);

		this.#tryStartStream();

		return () => {
			this.subscribersCount.decrement();
			unsubscribe?.();
		};
	}

	async #tryStartStream() {
		if (this.#stream || this.#starting) {
			return;
		}

		try {
			this.#starting = true;

			const aborter = new AbortController();
			const signal = aborter.signal;

			const response = await fetch(this.#url, { signal });

			const stream = (this.#stream = response.body);

			this.#starting = false;

			const reader =
				// @ts-ignore
				stream.pipeThrough(new TextDecoderStream()).getReader();

			// const textDecoder = new TextDecoder('utf-8');

			while (!signal.aborted) {
				const { value, done } = await reader.read();

				if (undefined === value) {
					break;
				}

				const obj = JSON.parse(value);
				// const obj = JSON.parse(textDecoder.decode(value));

				if (!done) {
					this.#store.set(obj);
				}

				// console.log({ ...obj, done });

				if (done) {
					break;
				}
			} // end for
		} catch (e) {
			this.#starting = false;
			this.#stream = null;

			if (e instanceof Error && e.name !== 'AbortError') {
				throw e;
			}
		}
	}
}
