<script>
	/**
	 * TabBarIcon component
	 *
	 * Following component guidelines from Skeleton
	 * @see https://next.skeleton.dev/docs/resources/contribute/components
	 */

	// import { ElementRect } from 'runed';

	import { onMount } from 'svelte';

	import { HkGridArea } from '../area';

	import HkIcon from './HkIcon.svelte';

	/**
	 * Properties
	 * ----------
	 * src - icon component
	 * theme - name of the icon set theme (e.g. 'solid' or 'outline')
	 * label - text of the label to place below the icon
	 *
	 * @type {{
	 *   src: import('./typedef.js').IconSource,
	 *   iconTheme?: string,
	 *   label?: string,
	 *   route?: string,
	 *   active?: boolean,
	 *   base?: string,
	 *   bg?: string,
	 *   padding?: string,
	 *   margin?: string,
	 *   classes?: string,
	 *   iconClasses? : string,
	 *   iconHeight?: string,
	 *   labelClasses? : string,
	 *   rect?: DOMRect,
	 * } & { [attr: string]: any }}
	 *
	 *
	 */
	let {
		// Functional
		src,
		iconTheme,
		label,
		route,

		active,

		// Style
		base,
		bg,
		padding,
		margin,
		classes,
		iconClasses,
		labelClasses,

		// Event handlers
		onmount,

		// Rest attributes
		...attrs
	} = $props();

	/** @type {HTMLElement} */
	let iconBoxElem;

	onMount(() => {
		onmount(iconBoxElem);
	});
</script>

{#snippet contents()}
	<div
		data-hk--icon-box
		class="flex aspect-square w-full justify-center"
		bind:this={iconBoxElem}
	>
		<HkIcon {src} size="100%" theme={iconTheme} classes={iconClasses} />
	</div>

	{#if label}
		<div data-hk--label class="flex w-full justify-center {labelClasses}">
			{label}
		</div>
	{/if}
{/snippet}

<HkGridArea
	data-hk-tab-icon
	boxMargin={margin}
	boxPadding={padding}
	base="grid-cols-1 justify-items-center cursor-pointer break-all overflow-clip h-full
  {active ? 'active' : ''}
  {label ? 'hasLabel' : ''} {base}"
	{bg}
	{...attrs}
>
	{#if !route}
		{@render contents()}
	{:else}
		<a href={route}>
			{@render contents()}
		</a>
	{/if}
</HkGridArea>

<style>
	a {
		display: block;
		text-decoration: none;
	}
</style>
