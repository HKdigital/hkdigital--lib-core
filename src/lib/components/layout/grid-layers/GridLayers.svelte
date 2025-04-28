<script>
	/**
	 * Grid Layers Component
	 *
	 * A component that creates a single-cell grid where all children exist
	 * in the same grid cell, allowing them to be positioned independently
	 * and stacked on top of each other. Perfect for complex layouts like
	 * overlaying text on images, card stacks, positioning UI elements, etc.
	 *
	 * Each child can use grid positioning properties (justify-self-*, self-*)
	 * for precise placement. Children can control stacking order with z-index.
	 *
	 * @example Basic usage with 9-position grid
	 * ```html
	 * <GridLayers classes="border w-[500px] h-[500px]">
	 *   <!-- Top Row -->
	 *   <div class="justify-self-start self-start">
	 *     <div class="bg-blue-500 w-[100px] h-[100px]">
	 *       Top Left
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-center self-start">
	 *     <div class="bg-blue-300 w-[100px] h-[100px]">
	 *       Top Center
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-end self-start">
	 *     <div class="bg-blue-500 w-[100px] h-[100px]">
	 *       Top Right
	 *     </div>
	 *   </div>
	 *
	 *   <!-- Middle Row -->
	 *   <div class="justify-self-start self-center">
	 *     <div class="bg-green-500 w-[100px] h-[100px]">
	 *       Middle Left
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-center self-center">
	 *     <div class="bg-green-300 w-[100px] h-[100px]">
	 *       Middle Center
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-end self-center">
	 *     <div class="bg-green-500 w-[100px] h-[100px]">
	 *       Middle Right
	 *     </div>
	 *   </div>
	 *
	 *   <!-- Bottom Row -->
	 *   <div class="justify-self-start self-end">
	 *     <div class="bg-red-500 w-[100px] h-[100px]">
	 *       Bottom Left
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-center self-end">
	 *     <div class="bg-red-300 w-[100px] h-[100px]">
	 *       Bottom Center
	 *     </div>
	 *   </div>
	 *   <div class="justify-self-end self-end">
	 *     <div class="bg-red-500 w-[100px] h-[100px]">
	 *       Bottom Right
	 *     </div>
	 *   </div>
	 * </GridLayers>
	 * ```
	 *
	 * @example Text over image
	 * ```html
	 * <GridLayers classes="w-full h-[300px]">
	 *   <!-- Background image layer -->
	 *   <div class="justify-self-stretch self-stretch z-0">
	 *     <img
	 *       src="/images/landscape.jpg"
	 *       alt="Landscape"
	 *       class="w-full h-full object-cover"
	 *     />
	 *   </div>
	 *
	 *   <!-- Text overlay layer -->
	 *   <div class="justify-self-center self-center z-10">
	 *     <div class="bg-black/50 p-16up text-white
	 *                 font-ui rounded-md">
	 *       <h2 class="text-2xl">Explore Nature</h2>
	 *       <p>Discover the beauty of the outdoors</p>
	 *     </div>
	 *   </div>
	 * </GridLayers>
	 * ```
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
		data-section="grid"
		class="absolute inset-0 grid {cellBase} {cellBg} {cellPadding} {cellMargin} {cellClasses}"
		style={cellStyle}
	>
		{@render children()}
	</div>
</div>

<style>
	/* All children of the layer share the same grid area
	   but aren't absolutely positioned */
	[data-section='grid'] {
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
	}

	[data-section='grid'] > :global(*) {
		grid-column: 1;
		grid-row: 1;
		z-index: 0; /* Base z-index to allow explicit stacking order */
	}
</style>
