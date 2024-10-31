import { onMount } from 'svelte';

import { lazySingleton } from '$lib/util/singleton/index.js';

import { beforeNavigate, onNavigate, afterNavigate } from '$app/navigation';

import { page } from '$app/stores';
import { get } from 'svelte/store';

class Navigation {
	// TODO: complete page type

	/** @type {{ url: { pathname: string } }} */
	page = $state(get(page));

	/** @type {string} */
	pathname = $derived(this.page.url.pathname);

	stage = $state.raw({ before: false, navigating: true, after: false });

	constructor() {
		beforeNavigate(() => {
			this.stage = { before: true, navigating: false, after: false };
		});

		onNavigate(() => {
			this.stage = { before: false, navigating: true, after: false };
		});

		// onNavigate(async () => {
		//   console.log('onNavigate can be used to perform async page transitions');
		//   return new Promise((resolve) => {
		//     setTimeout(resolve, 1000);
		//   });
		// });

		afterNavigate(() => {
			this.stage = { before: false, navigating: false, after: true };
		});

		onMount(() => {
			return page.subscribe((value) => {
				// console.log('***update page url');
				this.page = value;
			});
		});
	} // end constructor

	init() {}
} // end class

/**
 * @note call nav.init() during component initialization phase
 */
export const nav = lazySingleton({ class: Navigation });
