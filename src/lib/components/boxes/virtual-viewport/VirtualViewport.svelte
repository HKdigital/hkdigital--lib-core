<script>
  import { onMount } from 'svelte';

  /**
   * Virtual viewport component that creates a container with its own scaling
   * system based on its actual dimensions.
   *
   * @type {{
   *   designWidth?: number,
   *   designHeight?: number,
   *   minScale?: number,
   *   maxScale?: number,
   *   base?: string,
   *   bg?: string,
   *   classes?: string,
   *   width?: string,
   *   height?: string,
   *   aspect?: string,
   *   overflow?: string,
   *   scaleViewport?: number,
   *   scaleW?: number,
   *   scaleH?: number,
   *   scaleUI?: number,
   *   scaleTextContent?: number,
   *   scaleTextHeading?: number,
   *   scaleTextUI?: number,
   *   children?: import('svelte').Snippet,
   *   [attr: string]: any
   * }}
   */
  let {
    designWidth = 1920,
    designHeight = 1080,
    minScale = 0.75,
    maxScale = 1.5,
    base,
    bg,
    classes,
    width,
    height,
    aspect,
    overflow = 'overflow-clip',
    scaleViewport = $bindable(0),
    scaleW = $bindable(0),
    scaleH = $bindable(0),
    scaleUI = $bindable(0),
    scaleTextContent = $bindable(0),
    scaleTextHeading = $bindable(0),
    scaleTextUI = $bindable(0),
    children,
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

    // Apply clamping similar to root styles
    scaleUI = Math.max(minScale, Math.min(scaleViewport, maxScale));
    scaleTextContent = Math.max(
      minScale,
      Math.min(scaleViewport, maxScale)
    );
    scaleTextHeading = Math.max(
      0.75 * minScale,
      Math.min(scaleViewport, 2.25 * maxScale)
    );
    scaleTextUI = Math.max(
      0.5 * minScale,
      Math.min(scaleViewport, 1.25 * maxScale)
    );

    // Update the style variables
    scaleVars = `
      --scale-w: ${scaleW};
      --scale-h: ${scaleH};
      --scale-viewport: ${scaleViewport};
      --scale-ui: ${scaleUI};
      --scale-text-content: ${scaleTextContent};
      --scale-text-heading: ${scaleTextHeading};
      --scale-text-ui: ${scaleTextUI};
    `;
  }

  onMount(() => {
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
  });
</script>

<div
  data-component="virtual-viewport"
  bind:this={container}
  class="{base} {bg} {width} {height} {aspect} {overflow} {classes}"
  style={scaleVars}
  style:width={width || (height && aspect) ? undefined : '100%'}
  style:height={height || (width && aspect) ? undefined : '100%'}
  {...attrs}
>
  {@render children()}
</div>
