<script>
	/**
	 * @example
	 * // file.svelte
	 * <script>
	 * import AppLayout from '.../components/layout';
	 * <_/script>
	 *
	 * <AppLayout>
	 *   {#snippet bgSnippet()}
	 *     <BgGradient />
	 *   {/snippet}
	 *
	 *   {#snippet bottomSnippet()}
	 *     <BottomBar />
	 *   {/snippet}
	 *
	 *   Main content
	 *
	 * </AppLayout>
	 */

	import { useResizeObserver } from '../../util/svelte/observe/index.js';

	/**
	 * @typedef AppLayoutProps
	 *
	 * @property {import('svelte').Snippet|undefined} [bgPageSnippet]
	 * @property {import('svelte').Snippet|undefined} [bgSnippet]
	 * @property {import('svelte').Snippet|undefined} [topSnippet]
	 * @property {import('svelte').Snippet|undefined} [bottomSnippet]
	 * @property {import('svelte').Snippet} children
	 */

	/** @type {AppLayoutProps} */
	let {
		// > Functional

		/** @type {boolean} */
		// hasAuth = false,

		bgPageSnippet,
		bgSnippet,

		topSnippet,
		bottomSnippet,

		children

		// > Style

		// base = '',
		// bg = '',
		// classes = '',

		// > Background (child) styles

		// > AppTop (child) styles

		// appTopBase = '',
		// appTopBg = '',
		// appTopPadding = '',
		// appTopMargin = '',
		// appTopClasses = ''
	} = $props();

	// setAppLayoutContext({});

	// Observe AppLayoutHeight

	/** @type {HTMLElement|null} */
	let elemAppLayout = $state(null);
	let elemAppLayoutHeight = $state(0);
	let elemAppLayoutWidth = $state(0);

	useResizeObserver(
		() => elemAppLayout,
		(entries) => {
			for (const { contentRect } of entries) {
				// console.log('elemLayoutHeight', entry.contentRect.height);
				elemAppLayoutHeight = contentRect.height;
				elemAppLayoutWidth = contentRect.width;
				break;
			}
		}
	);

	// Observe layoutTopHeight

	/** @type {HTMLElement|null} */
	// let elemLayoutTop = $state(null);
	// let elemLayoutTopHeight = $state(0);

	// useResizeObserver(
	//   () => elemLayoutTop,
	//   (entries) => {
	//     for (const entry of entries) {
	//       console.log('elemLayoutTopHeight', entry.contentRect.height);
	//       elemLayoutTopHeight = entry.contentRect.height;
	//       break;
	//     }
	//   }
	// );

	// Observe layoutContentHeight

	/** @type {HTMLElement|null} */
	let elemLayoutContent = $state(null);
	let elemLayoutContentHeight = $state(0);

	useResizeObserver(
		() => elemLayoutContent,
		(entries) => {
			for (const entry of entries) {
				// console.log('elemLayoutHeight', entry.contentRect.height);
				elemLayoutContentHeight = entry.contentRect.height;
				break;
			}
		}
	);

	// Observe layoutBottomHeight

	/** @type {HTMLElement|null} */
	let elemLayoutBottom = $state(null);

	let elemLayoutBottomHeight = $state(0);

	useResizeObserver(
		() => elemLayoutBottom,
		(entries) => {
			for (const entry of entries) {
				// console.log('elemLayoutBottomRect', entry.contentRect);
				elemLayoutBottomHeight = entry.contentRect.height;
				break;
			}
		}
	);

	let contentMarginBottom = $derived(elemLayoutBottomHeight);

	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let outerHeight = $state(0);
</script>

<svelte:window bind:innerWidth bind:innerHeight bind:outerHeight />

<div data-layout-page-bg class="fixed z-0 h-screen w-screen">
	{#if bgPageSnippet}
		{@render bgPageSnippet()}
	{/if}
</div>

<!-- <div
  data-app-layout
  class="g-no-select g-no-double-tab-zoom relative z-10 mx-auto grid min-h-lvh w-full grid-cols-[1fr] place-items-stretch border-8 border-green-500"
  bind:this={elemAppLayout}
> -->
<div
	data-app-layout
	class="g-no-select g-no-double-tab-zoom relative z-10 mx-auto min-h-svh w-full"
	bind:this={elemAppLayout}
>
	<!-- BG (fixed)) -->

	<div
		data-layout-bg
		class="relative bottom-0 z-20 h-svh w-full"
		style:position={elemAppLayoutWidth ? 'fixed' : 'static'}
		style:width={elemAppLayoutWidth ? `${elemAppLayoutWidth}px` : 'auto'}
	>
		{#if bgSnippet}
			{@render bgSnippet()}
		{/if}
	</div>

	<!-- FG (top, content) -->

	<div data-layout-fg class="relative z-30 flex min-h-svh w-full flex-col">
		<div data-layout-top class="relative z-40 w-full">
			{#if topSnippet}
				{@render topSnippet()}
			{/if}
		</div>

		<div
			data-layout-content
			class="relative z-40 flex w-full grow flex-col"
			bind:this={elemLayoutContent}
			style:margin-bottom={`${contentMarginBottom}px`}
		>
			<!-- <div class="border text-white">
        Top height: [{elemLayoutTopHeight}]<br />
        Content height: [{elemLayoutContentHeight}]<br />
        Bottom height: [{elemLayoutBottomHeight}]<br />
        App Layout height: [{elemAppLayoutHeight}]<br />
        Content margin bottom [{contentMarginBottom}]<br />
        innerWidth [{innerWidth}]<br />
        innerHeight [{innerHeight}]
      </div> -->
			<!-- -webkit-font-smoothing: antialiased; -->
			{@render children()}
		</div>
	</div>

	<!-- Bottom (fixed) -->

	<div
		data-layout-bottom
		bind:this={elemLayoutBottom}
		class="bottom-0 z-50 mx-auto"
		style:position={elemAppLayoutWidth ? 'fixed' : 'static'}
		style:width={elemAppLayoutWidth ? `${elemAppLayoutWidth}px` : 'auto'}
	>
		{#if bottomSnippet}
			{@render bottomSnippet()}
		{/if}

		<!-- <AppBottom
      base={appTopBase}
      bg={appTopBg}
      padding={appTopPadding}
      margin={appTopMargin}
      classes={appTopClasses}
    /> -->
	</div>
</div>

<style>
	[data-layout-page-bg] {
		overflow: hidden;
	}

	[data-layout-bg] {
		grid-area: 1 / 1 / 2 / 2; /* row-start, col-start, row-end, col-end */
		overflow: hidden;
	}

	[data-layout-fg] {
		grid-area: 1 / 1 / 2 / 2; /* row-start, col-start, row-end, col-end */
	}

	:global(html:not(.no-scrollbar-shift-fix)) {
		/*
    * Shift contents of page to the left when scrollbar appears,
    * so content like tab bars stay centered
    */
		padding-left: calc(100vw - 100%);
	}
</style>
