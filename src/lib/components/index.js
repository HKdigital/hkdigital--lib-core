// > area

export { default as HkArea } from '$lib/components/area/HkArea.svelte';
export { default as HkGridArea } from '$lib/components/area/HkGridArea.svelte';

// > icon

export { default as HkIcon } from '$lib/components/icon/HkIcon.svelte';
export { default as HkTabIcon } from '$lib/components/icon/HkTabIcon.svelte';

export * from '$lib/components/icon/icon.type.js';

// > layout

export {
	createOrGetState as createOrGetAppLayoutState,
	createState as createAppLayoutState,
	getState as getAppLayoutState
} from '$lib/components/layout/HkAppLayout.state.svelte.js';

export { default as HkAppLayout } from '$lib/components/layout/HkAppLayout.svelte';
export { default as HkGridLayers } from '$lib/components/layout/HkGridLayers.svelte';

// > tab-bar

export {
	createOrGetState as createOrGetTabBarState,
	createState as createTabBarState,
	getState as getTabBarState
} from '$lib/components/layout/HkAppLayout.state.svelte.js';

export { default as HkTabBar } from '$lib/components/tab-bar/HkTabBar.svelte';

export {
	createOrGetState as createOrGetTabBarSelectorState,
	createState as createTabBarSelectorState,
	getState as getTabBarSelectorState
} from '$lib/components/layout/HkAppLayout.state.svelte.js';

export { default as HkTabBarSelector } from '$lib/components/tab-bar/HkTabBarSelector.svelte';
