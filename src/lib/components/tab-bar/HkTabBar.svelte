<script>
	/**
	 * TabBar component
	 *
	 * Following component guidelines from Skeleton
	 * @see https://next.skeleton.dev/docs/resources/contribute/components
	 */

	import { createOrGetState } from './HkTabBar.state.svelte';

	import { HkGridArea } from '../area/index.js';

	/**
	 * @type {{
	 *   cols?: number,
	 *   base?: string,
	 *   bg?: string,
	 *   padding?: string,
	 *   margin?: string,
	 *   classes?: string,
	 *   style?: string,
	 *   contextKey?: Symbol | string,
	 *   children: import('svelte').Snippet,
	 *   onmount?: function,
	 *   domElem?: HTMLElement
	 * } & { [attr: string]: any }}
	 */
	let {
		// Functional
		cols = 3,

		// Style
		base,
		bg,
		padding,
		margin,
		classes,

		style,

		// State
		contextKey,

		// Snippets
		children,

		// Event handlers
		onmount,

		// DOM Elements
		domElem = $bindable(),

		// Rest attributes
		...attrs
	} = $props();

	createOrGetState(contextKey);

	//grid-cols-[repeat({cols},minmax(0,auto))]
</script>

<HkGridArea
	data-hk-tab-bar
	base="justify-center content-stretch items-center {base}"
	style="grid-template-columns: repeat({cols}, minmax(0,auto)); {style}"
	boxBg={bg}
	boxPadding={padding}
	boxMargin={margin}
	bind:boxDomElem={domElem}
	{classes}
	{...attrs}
>
	{@render children()}
</HkGridArea>
