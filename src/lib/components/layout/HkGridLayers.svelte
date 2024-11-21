<script>
	/**
	 * Grid Layers component
	 * This is a grid with only one cell. All direct children are
	 * place in the same cell and form a visually stacked component.
	 *
	 * This can be used to place e.g. texts over an image. Place the
	 * image in a layer and the text in another. The standard grid
	 * content placement options can be used.
	 *
	 * Following component guidelines from Skeleton
	 * @see https://next.skeleton.dev/docs/resources/contribute/components
	 */

	/**
	 * @type {{
	 *   base?: string,
	 *   bg?: string,
	 *   padding?: string,
	 *   margin?: string,
	 *   height?: string,
	 *   classes?: string,
	 *   style?: string,
	 *   boxBase?: string,
	 *   boxBg?: string,
	 *   boxPadding?: string,
	 *   boxMargin?: string,
	 *   boxClasses?: string,
	 *   boxAttrs?: { [attr: string]: * },
	 *   children: import('svelte').Snippet
	 * } & { [attr: string]: * }}
	 */
	const {
		// Style
		base,
		bg,
		padding,
		margin,
		height = 'h-full',
		classes,
		style,
		boxBase,
		boxBg,
		boxPadding,
		boxMargin,
		boxClasses,

		// Snippets
		children,

		// Attributes
		...attrs
	} = $props();
</script>

<div
	data-hk-grid-layers-box
	class="{boxBase} {boxBg} {boxPadding} {boxMargin} {boxClasses}"
	{...attrs}
>
	<div
		data-hk-grid-layers
		class="grid grid-cols-1 grid-rows-1 {base} {bg} {height} {classes} {margin} {padding}"
		{style}
	>
		{@render children()}
	</div>
</div>

<style>
	[data-hk-grid-layers] > :global(.area-above) {
		grid-area: 1/1/2/2;
	}

	& [data-hk-grid-layers] > :global(*) {
		grid-area: 2/1/3/2;
	}

	& [data-hk-grid-layers] > :global(.area-below) {
		grid-area: 3/1/4/2;
	}
</style>
