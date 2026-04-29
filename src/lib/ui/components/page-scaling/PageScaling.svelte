<script>
  import { onMount } from 'svelte';

  import {
    enableScalingUI,
    enableViewportBreakpoints,
    designTokens as defaultTokens,
    SCALING_WIDTH
  } from '$lib/design/index.js';

  /**
   * Applies viewport-based design scaling to the page by setting CSS custom
   * properties (--scale-ui, --scale-text-base, etc.) on :root. Also sets
   * data-viewport on <html> so components can adapt to named viewport
   * sizes (sm / md / lg) via CSS.
   *
   * Renders children directly with no wrapper element.
   *
   * Use viewportScalingMode SCALING_WIDTH for websites (default) and
   * SCALING_FIT for fixed-aspect containers like games.
   *
   * @type {{
   *   design?: {width: number, height: number},
   *   clamping?: {
   *     ui: {min: number, max: number},
   *     textBase: {min: number, max: number},
   *     textHeading: {min: number, max: number},
   *     textUi: {min: number, max: number}
   *   },
   *   breakpoints?: {md: number, lg: number},
   *   viewportScalingMode?: 'fit'|'width'|'height'|'fill',
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    design = defaultTokens.DESIGN,
    clamping = defaultTokens.CLAMPING,
    breakpoints = defaultTokens.VIEWPORT_BREAKPOINTS,
    viewportScalingMode = SCALING_WIDTH,
    children
  } = $props();

  onMount(() => {
    const cleanupScaling =
      enableScalingUI(design, clamping, viewportScalingMode);

    const cleanupViewport = enableViewportBreakpoints(breakpoints);

    return () => {
      cleanupScaling();
      cleanupViewport();
    };
  });
</script>

{@render children?.()}
