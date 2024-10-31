import { onMount, onDestroy } from 'svelte';

/**
 * @param {function} target
 * @param {(entries:ResizeObserverEntry[]) => void} callback
 * @param {object} [options]
 *
 * @returns {{ stop: () => void }}
 */
export function useResizeObserver(target, callback, options) {
	/** @type {HTMLInputElement} */
	let elem;

	/** @type {ResizeObserver|undefined} */
	let resizeObserver;

	onMount(() => {
		// console.log('useResizeObserver:onMount');

		if (target instanceof HTMLInputElement) {
			elem = target;
		} else if (typeof target === 'function') {
			let output = target();

			// console.log({ output });

			elem = output;
		} else {
			throw new Error('Invalid value for parameter [target]');
		}

		resizeObserver = new ResizeObserver(callback);

		resizeObserver.observe(elem);
	});

	onDestroy(() => {
		// console.log('useResizeObserver:onDestroy');

		if (resizeObserver) {
			resizeObserver.unobserve(elem);
			resizeObserver = undefined;
		}
	});

	return {
		stop: () => {}
	};
}
