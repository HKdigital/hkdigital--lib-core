<script>
  import { enableContainerScaling } from '$lib/design/index.js';

  /**
   * @typedef {{
   *   enableScaling?: boolean,
   *   design?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   width: number,
   *   height: number,
   *   hidden?: boolean,
   *   children: import('svelte').Snippet
   * }}
   */

  /**
   * Wrapper component that applies container scaling to its children
   *
   * @type {{
   *   enableScaling?: boolean,
   *   design?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   width: number,
   *   height: number,
   *   hidden?: boolean,
   *   children: import('svelte').Snippet
   * }}
   */
  let {
    enableScaling = false,
    design = undefined,
    clamping = undefined,
    width,
    height,
    hidden = false,
    children
  } = $props();

  let container = $state();

  // Apply container scaling when enabled and not hidden
  $effect(() => {
    if (
      !enableScaling ||
      !container ||
      !width ||
      !height ||
      hidden ||
      !design
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

<div
  bind:this={container}
  class:hidden
  style:width="{width}px"
  style:height="{height}px"
>
  {@render children()}
</div>

<style>
  .hidden {
    visibility: hidden;
  }
</style>
