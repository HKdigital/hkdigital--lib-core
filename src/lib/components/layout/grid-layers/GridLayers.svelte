<script>
  import { onMount, onDestroy } from 'svelte';
  import { setupLayerObserver, measureTargetLayer } from './util.js';

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
   *   heightFrom?: string|null,
   *   children: import('svelte').Snippet,
   *   cellAttrs?: { [attr: string]: any },
   *   [attr: string]: any
   * }}
   */
  const {
    // Style
    base = '',
    bg = '',
    padding = '',
    margin = '',
    height = 'h-full',
    classes = '',
    style = '',
    cellBase = '',
    cellBg = '',
    cellPadding = '',
    cellMargin = '',
    cellClasses = '',
    cellStyle = '',

    // Behavior
    heightFrom = null,

    // Props
    cellAttrs = {},
    children,

    // Attributes
    ...attrs
  } = $props();

  // Component state
  let gridContainer = $state(null);
  let gridContent = $state(null);
  let calculatedHeight = $state(0);
  let observer = $state(null);
  let targetLayer = $state(null);
  let isFirstRender = $state(heightFrom !== null); // Start with true if heightFrom is provided
  let preCalculatedHeight = $state(0);

  // Derived container style that updates reactively when dependencies change
  let containerStyle = $derived.by(() => {
    const styles = [];

    if (style) {
      styles.push(style);
    }

    if (heightFrom && calculatedHeight > 0) {
      styles.push(`height: ${calculatedHeight}px;`);
    }

    return styles.join(' ');
  });

  /**
   * Handler for height changes detected by the observer
   * @param {number} newHeight - The new calculated height
   */
  function handleHeightChange(newHeight) {
    calculatedHeight = newHeight;
  }

  /**
   * Initialize height measurement and observation
   */
  function initializeHeightTracking() {
    if (!heightFrom || !gridContent) return;

    // Measure the layer initially
    const { element, height } = measureTargetLayer(gridContent, heightFrom);

    if (element) {
      targetLayer = element;
      calculatedHeight = height;

      // Setup observer for future changes
      observer = setupLayerObserver(element, handleHeightChange);
    }
  }

  // Initialize on mount with the two-pass rendering approach
  onMount(() => {
    if (heightFrom) {
      // First render: measure invisibly
      requestAnimationFrame(() => {
        if (gridContent) {
          const { element, height } = measureTargetLayer(gridContent, heightFrom);

          if (element) {
            targetLayer = element;
            preCalculatedHeight = height;

            // Second render: show with correct height
            requestAnimationFrame(() => {
              calculatedHeight = preCalculatedHeight;
              isFirstRender = false;

              // Setup observer for future changes
              observer = setupLayerObserver(element, handleHeightChange);
            });
          } else {
            // No target layer found, just show the component
            isFirstRender = false;
          }
        } else {
          // No grid content, just show the component
          isFirstRender = false;
        }
      });
    } else {
      // No heightFrom, no need for measurement
      isFirstRender = false;
    }
  });

  // Effect to re-setup observer when either the target layer or heightFrom changes
  $effect(() => {
    // Only handle changes after initial setup
    if (!isFirstRender && heightFrom && gridContent && !observer) {
      initializeHeightTracking();
    }
  });

  // Clean up on destroy
  onDestroy(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  });

</script>

<div
  data-component="grid-layers"
  bind:this={gridContainer}
  class="relative {isFirstRender ? 'invisible' : ''} {base} {bg} {heightFrom ? '' : height} {classes} {margin} {padding}"
  style={containerStyle}
  {...attrs}
>
  <div
    data-section="grid"
    bind:this={gridContent}
    class="absolute inset-0 grid {cellBase} {cellBg} {cellPadding} {cellMargin} {cellClasses}"
    style={cellStyle}
    {...cellAttrs}
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
