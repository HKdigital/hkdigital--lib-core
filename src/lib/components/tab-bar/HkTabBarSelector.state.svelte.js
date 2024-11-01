import { defineStateContext } from '../../util/svelte/state-context/index.js';

import { useResizeObserver } from '../../util/svelte/observe/index.js';

/* ------------------------------------------------------- Define state class */

export class HkTabBarSelectorState {
	/** @type {HTMLElement|undefined} */
	// outer = $state.raw();
	// outerBox = $state.raw();

	/** @type {number} */
	// tabBarWidth = $state(0);

	selectorWidth = $state(0);
	selectorStyle = $state('');

	//currentTabIndex;

	/** @type {DOMRect[]} */
	iconSizes = [];

	constructor() {
		// $effect(() => {
		//   if (this.outer) {
		//     this.outerBox = this.outer.getBoundingClientRect();
		//   }
		// });
	}

	/**
	 * Link the tab bar selector to a tab bar state
	 *
	 * @param {import('./HkTabBar.svelte').TabBarState} tabBarState
	 */
	linkToTabBarState(tabBarState) {
		// console.log('setBottomBar', bottomBarState);

		// if this.bottomBarState > error

		this.tabBarState = tabBarState;

		$effect(() => {
			tabBarState.currentTabIndex;

			// console.log('currentTabIndex $effect');

			this.#updateSelector();
		});

		useResizeObserver(
			() => tabBarState.tabBarElement,
			(entries) => {
				this.#updateSelector();
			}
		);
	}

	/**
	 * Update the size and position of the selector
	 */
	#updateSelector() {
		if (!this.tabBarState) {
			return;
		}

		const { currentTabIndex, tabBarElement, tabElements } = this.tabBarState;

		const tabElem = tabElements[currentTabIndex];

		if (!tabElem || !tabBarElement) {
			return;
		}

		const tabElemRect = tabElem.getBoundingClientRect();

		const tabBarRect = tabBarElement.getBoundingClientRect();

		// const offsetX = (iconWidth - selectorWidth) / 2 - outerBox.x;
		const offsetX = (tabElemRect.width - this.selectorWidth) / 2 - tabBarRect.x;

		const x = tabElemRect.x + offsetX;
		const w = tabBarRect.width;

		this.selectorStyle = `left: ${(100 * x) / w}%; opacity: 1;`;

		// console.log('selectorStyle', this.selectorStyle);
	}
}

/* -------------------------------------- Export create & get state functions */

export const [createOrGetState, createState, getState] = defineStateContext(HkTabBarSelectorState);
