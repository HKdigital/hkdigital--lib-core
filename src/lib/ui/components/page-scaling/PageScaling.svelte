<script>
  import { onMount } from 'svelte';

  import {
    enableScalingUI,
    designTokens as defaultTokens,
    SCALING_WIDTH
  } from '$lib/design/index.js';

  /**
   * Applies viewport-based design scaling to the page by setting CSS custom
   * properties (--scale-ui, --scale-text-base, etc.) on :root. Renders
   * children directly with no wrapper element.
   *
   * Use scalingMode SCALING_WIDTH for websites (default) and SCALING_FIT
   * for fixed-aspect containers like games.
   *
   * @type {{
   *   design?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   scalingMode?: 'fit'|'width'|'height'|'fill',
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    design = defaultTokens.DESIGN,
    clamping = defaultTokens.CLAMPING,
    scalingMode = SCALING_WIDTH,
    children
  } = $props();

  onMount(() => {
    return enableScalingUI(design, clamping, scalingMode);
  });
</script>

{@render children?.()}
