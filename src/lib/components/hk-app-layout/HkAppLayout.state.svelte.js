import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

import { browser } from '$app/environment';

import { MediaQuery } from 'svelte/reactivity';

/* ------------------------------------------------------- Define state class */

export class AppLayoutState {
	landscapeOnSmallScreen = $state(false);

	constructor() {
		if (browser) {
			let mq = new MediaQuery('(max-height: 400px');

			$effect(() => {
				this.landscapeOnSmallScreen = mq.matches ? true : false;
			});
		}
	}
}

/* -------------------------------------- Export create & get state functions */

export const [createOrGetState, createState, getState] = defineStateContext(AppLayoutState);
