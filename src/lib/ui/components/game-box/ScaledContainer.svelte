<script>
  import { clamp, enableContainerScaling } from '$lib/design/index.js';

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
      !clamping ||
      hidden
    ) {
      return;
    }

    // console.debug(`Enable scaling [${width},${height}]`);

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
    bind:this={container}
    class:hidden
    style:width="{width}px"
    style:height="{height}px"
  >
    {@render snippet(snippetParams)}
  </div>
{/if}

<style>
  .hidden {
    visibility: hidden;
  }
</style>
