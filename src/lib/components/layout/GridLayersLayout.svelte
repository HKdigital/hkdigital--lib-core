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
	 *   cellBase?: string,
	 *   cellBg?: string,
	 *   cellPadding?: string,
	 *   cellMargin?: string,
	 *   cellClasses?: string,
	 *   cellStyle?: string,
	 *   children: import('svelte').Snippet,
	 *   cellAttrs?: { [attr: string]: * },
	 *   [attr: string]: any
	 * }}
	 */
	const {
		// Style
		base,
		bg,
		padding,
		margin,
		height,
		classes,
		style,
		cellBase,
		cellBg,
		cellPadding,
		cellMargin,
		cellClasses,
		cellStyle,

		cellAttrs,

		// Snippets
		children,

		// Attributes
		...attrs
	} = $props();
</script>

<div
	data-component="grid-layers"
	class="relative {base} {bg} {height} {classes} {margin} {padding}"
	{style}
	{...attrs}
>
	<div
		data-section="layer"
		class="absolute inset-0 grid {cellBase} {cellBg} {cellPadding} {cellMargin} {cellClasses}"
		style={cellStyle}
	>
		{@render children()}
	</div>
</div>

<style>
	/* All children of the layer share the same grid area
	   but aren't absolutely positioned */
	[data-section='layer'] {
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	[data-section='layer'] > :global(*) {
		grid-column: 1;
		grid-row: 1;
		z-index: 0; /* Base z-index to allow explicit stacking order */
	}
</style>
