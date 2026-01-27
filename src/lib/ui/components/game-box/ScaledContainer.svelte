<script>
  // import { onMount } from 'svelte';

  import { enableContainerScaling } from '$lib/design/index.js';

  // onMount( () => {
  //   console.debug('[ScaledContainer] mounted');
  // } );

  /**
   * Wrapper component that applies container scaling to its children
   *
   * @type {{
   *   enableScaling?: boolean,
   *   design?: {width: number, height: number},
   *   clamping: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   width: number,
   *   height: number,
   *   hidden?: boolean,
   *   snippet?: import('./typedef.js').GameBoxSnippet,
   *   snippetParams: import('./typedef.js').SnippetParams
   * }}
   */
  let {
    enableScaling = false,
    design,
    clamping,
    width,
    height,
    hidden = false,
    snippet,
    snippetParams
  } = $props();

  let container = $state();

  // Apply container scaling when enabled and not hidden
  $effect(() => {
    if (
      !container ||
      !enableScaling ||
      !width ||
      !height ||
      !design ||
      !clamping
      // || hidden
    ) {
      return;
    }

    console.debug(`Enable scaling [${width},${height}]`);

    return enableContainerScaling({
      container,
      design,
      clamping,
      getDimensions: () => ({ width, height })
    });
  });
</script>

{#if snippet && snippetParams}
  <div
    data-component="scaled-container"
    bind:this={container}
    style:position="absolute"
    style:top="0"
    style:left="0"
    style:width="{width}px"
    style:height="{height}px"
    style:visibility={hidden ? "hidden" : "visible"}
  >
    {@render snippet(snippetParams)}
  </div>
{/if}

<style>
  /* Positioning and visibility handled via inline styles */
</style>
