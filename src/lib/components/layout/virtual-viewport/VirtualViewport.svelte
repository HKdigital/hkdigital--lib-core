<script>
  import { onMount } from 'svelte';
  import {
    getRootCssDesignWidth,
    getRootCssDesignHeight,
    getClampParams,
    clamp
  } from '$lib/util/design-system/index.js';

  /**
   * Virtual viewport component that creates a container with its own scaling
   * system based on its actual dimensions.
   *
   * @type {{
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   width?: string,
   *   height?: string,
   *   overflow?: string,
   *   designWidth?: number,
   *   designHeight?: number,
   *   scaleViewport?: number,
   *   scaleW?: number,
   *   scaleH?: number,
   *   scaleUI?: number,
   *   scaleTextBase?: number,
   *   scaleTextHeading?: number,
   *   scaleTextUI?: number,
   *   children?: import('svelte').Snippet,
   *   [attr: string]: any
   * }}
   */
  let {
    // Style related props first
    base,
    bg,
    classes,
    width,
    height,
    overflow = 'overflow-clip',

    // Functional bindable props
    designWidth = $bindable(0),
    designHeight = $bindable(0),
    scaleViewport = $bindable(0),
    scaleW = $bindable(0),
    scaleH = $bindable(0),
    scaleUI = $bindable(0),
    scaleTextBase = $bindable(0),
    scaleTextHeading = $bindable(0),
    scaleTextUI = $bindable(0),

    // Snippets
    children,

    // Rest of attributes
    ...attrs
  } = $props();

  /**
   * References to the container element for measurement
   * @type {HTMLDivElement}
   */
  let container;

  /**
   * Current scaling variables
   */
  let scaleVars = $state('');

  // No separate variables for design dimensions

  /**
   * Error state for CSS variable parsing
   */
  let cssParsingError = $state(null);

  /**
   * Update scaling based on current dimensions
   */
  function updateScaling() {
    if (!container) return;

    // Get actual container dimensions
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    // Calculate ratios similar to root variables
    scaleW = containerWidth / designWidth;
    scaleH = containerHeight / designHeight;

    // Use the smaller ratio to ensure content fits
    scaleViewport = Math.min(scaleW, scaleH);

    try {
      // Get clamp parameters from CSS variables
      const uiParams = getClampParams('scale-ui');
      const baseParams = getClampParams('scale-text-base');
      const headingParams = getClampParams('scale-text-heading');
      const textUIParams = getClampParams('scale-text-ui');

      // Apply scaling according to extracted clamp parameters
      scaleUI = clamp(uiParams.min, scaleViewport, uiParams.max);

      scaleTextBase = clamp(baseParams.min, scaleViewport, baseParams.max);
      scaleTextHeading = clamp(
        headingParams.min,
        scaleViewport,
        headingParams.max
      );
      scaleTextUI = clamp(textUIParams.min, scaleViewport, textUIParams.max);

      // Clear any previous error
      cssParsingError = null;
    } catch (error) {
      // Store the error for debugging
      cssParsingError = error;
      console.error('VirtualViewport scaling error:', error);

      // Fallback to simple scaling without clamping
      scaleUI = scaleViewport;
      scaleTextBase = scaleViewport;
      scaleTextHeading = scaleViewport;
      scaleTextUI = scaleViewport;
    }

    // Update the style variables
    scaleVars = `
      --scale-w: ${scaleW};
      --scale-h: ${scaleH};
      --scale-viewport: ${scaleViewport};
      --scale-ui: ${scaleUI};
      --scale-text-base: ${scaleTextBase};
      --scale-text-heading: ${scaleTextHeading};
      --scale-text-ui: ${scaleTextUI};
    `;
  }

  // Watch for changes and update scaling
  $effect(() => {
    updateScaling();
  });

  onMount(() => {
    try {
      // Get design dimensions from CSS variables if props are zero
      if (designWidth === 0) {
        designWidth = getRootCssDesignWidth() ?? 1920;
      }

      if (designHeight === 0) {
        designHeight = getRootCssDesignHeight() ?? 1080;
      }

      // Initial calculation
      updateScaling();

      // Set up ResizeObserver to update scaling when container size changes
      const resizeObserver = new ResizeObserver(() => {
        updateScaling();
      });

      resizeObserver.observe(container);

      // Clean up
      return () => {
        resizeObserver.disconnect();
      };
    } catch (error) {
      cssParsingError = error;
      console.error('VirtualViewport initialization error:', error);
    }
  });
</script>

<div
  data-component="virtual-viewport"
  bind:this={container}
  class="{base} {bg} {width} {height} {overflow} {classes}"
  style={scaleVars}
  style:width={width ? width : '100%'}
  style:height={height ? height : '100%'}
  {...attrs}
>
  {#if cssParsingError}
    <!-- Add a discreet error indicator for development -->
    <div
      class="absolute top-0 right-0 p-1 text-red-500 text-xs bg-black bg-opacity-50 rounded-bl"
    >
      CSS Parsing Error
    </div>
  {/if}
  {@render children()}
</div>
