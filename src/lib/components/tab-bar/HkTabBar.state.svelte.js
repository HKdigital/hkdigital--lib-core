import { defineStateContext } from '$lib/util/svelte/state-context/index.js';

import { nav } from '$lib/states/navigation.svelte.js';
import { goto } from '$app/navigation';

/**
 * @typedef {import('./typedef.js').Tab} Tab
 */

/* ------------------------------------------------------- Define state class */

export class HkTabBarState {
	/** @type {Tab[]} */
	tabs = $state.raw([]);

	/** @type {*} */
	tabBarElement = $state();

	/** @type {HTMLElement[]} */
	tabElements = [];

	currentTabIndex = $state(-1);

	/** @type {Tab|null} */
	currentTab = $state(null);

	// /** @type {boolean} */
	// ready = $derived(this.currentTab !== null);

	constructor() {
		$effect.pre(() => {
			// > Update this.currentTab

			const tabs = this.tabs;

			if (!this.tabs?.length || this.currentTabIndex === -1) {
				this.currentTab = null;
			} else {
				const index = this.currentTabIndex;
				const tabValue = tabs[index] ?? null;

				// console.log('Selected active tab', index, tabValue);

				this.currentTab = tabValue;
			}
		});
	} // end constructor

	/**
	 * Set tab contents
	 *
	 * @param {Tab[]} tabs
	 */
	setTabs(tabs) {
		// console.log('setTabs', tabs);
		this.tabs = tabs;

		if (this.currentTabIndex >= tabs.length) {
			this.currentTabIndex = 0;
		}
	}

	/**
	 * Navigate to the route that is specified on the current tab (if any)
	 */
	navigate() {
		if (!this.currentTab || !this.currentTab.route) {
			return;
		}

		goto(this.currentTab.route);
	}

	/**
	 * Select the tab that has a route property that matches the current
	 * browser location pathname
	 *
	 * @note the pathname starts with a '/'
	 *
	 * @param {string} [pathname]
	 *   If not specified, pathname from the browser's location will be used
	 */
	selectTabByPathName(pathname) {
		if (!this.tabs.length) {
			return;
		}

		if (!pathname) {
			pathname = nav.pathname;
		}

		// console.log(`selectTabByPathName [${pathname}]`);

		const tabs = this.tabs;

		// > Try to find an exact match

		for (let j = 0, n = tabs.length; j < n; j = j + 1) {
			const tab = tabs[j];

			if (tab.route && tab.route === pathname) {
				//console.log('Found tab by route', tab);
				this.selectTabByIndex(j);

				return;
			}
		} // end for

		// > Try to find a match using a route prefix

		for (let j = 0, n = tabs.length; j < n; j = j + 1) {
			const tab = tabs[j];

			if (tab.routePrefix && pathname.startsWith(tab.routePrefix)) {
				//console.log('Found tab by route prefix', tab);
				this.selectTabByIndex(j);

				return;
			}
		} // end for
	}

	/**
	 * Select a tab by its index in the array this.tabs
	 *
	 * @param {number} index
	 */
	selectTabByIndex(index) {
		// console.log(`Select tab by index [${index}]`);
		this.currentTabIndex = index;
	}

	/**
	 * Link a tab to a DOM element
	 * - An reference is stored as property
	 * - This reference can be used by extensions of this tab bar,
	 *   e.g. to manipulate the visual appearance of the tabs
	 *
	 * @param {number} index
	 * @param {HTMLElement} tabElement
	 */
	linkTab(index, tabElement) {
		this.tabElements[index] = tabElement;
	}
} // end class

/* -------------------------------------- Export create & get state functions */

export const [createOrGetState, createState, getState] = defineStateContext(HkTabBarState);
