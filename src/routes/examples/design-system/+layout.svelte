<script>
  import { onMount } from 'svelte';
  import { VirtualViewport } from '$lib/components/layout/index.js';
  import { Button, TextButton } from '$lib/components/buttons/index.js';

  let { children } = $props();

  // Track viewport scaling values
  let viewportScaleViewport = $state(0);
  let viewportScaleW = $state(0);
  let viewportScaleH = $state(0);
  let viewportScaleUI = $state(0);
  let viewportScaleTextContent = $state(0);
  let viewportScaleTextHeading = $state(0);
  let viewportScaleTextUI = $state(0);

  // Bindable design dimensions for VirtualViewport
  let designWidth = $state(0);
  let designHeight = $state(0);

  // Reference to the container div
  let containerElement;

  // Current preset dimensions
  let currentPreset = $state({
    width: 1024,
    height: 576
  });

  // Zoom options
  const zoomOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 }
  ];

  // Current zoom value
  let currentZoom = $state(1);

  // Define viewport presets
  const viewportPresets = [
    { name: 'phone (640)', width: 640, height: 640 },
    { name: 'md (768)', width: 768, height: 576 },
    { name: 'lg (1024)', width: 1024, height: 576 },
    { name: 'xl (1280)', width: 1280, height: 720 },
    { name: '2xl (1536)', width: 1536, height: 864 },
    { name: 'hd (1920)', width: 1920, height: 1080 }
  ];

  /**
   * Check if a preset matches the current design dimensions
   *
   * @param {number} width - The preset width
   * @param {number} height - The preset height
   * @returns {boolean} True if the preset matches the design dimensions
   */
  function isCurrentPreset(width, height) {
    return width === currentPreset.width && height === currentPreset.height;
  }

  /**
   * Apply preset size to the container with zoom
   *
   * @param {number} width - The preset width
   * @param {number} height - The preset height
   */
  function applyViewportSize(width, height) {
    if (!containerElement) return;

    // Update current preset
    currentPreset = { width, height };

    // Apply size with zoom
    applyZoom(currentZoom);
  }

  /**
   * Apply the selected zoom to the current preset size
   *
   * @param {number} zoom - The zoom value
   */
  function applyZoom(zoom) {
    if (!containerElement || !currentPreset) return;

    // Update current zoom
    currentZoom = zoom;

    // Apply the calculated size
    const scaledWidth = Math.round(currentPreset.width * zoom);
    const scaledHeight = Math.round(currentPreset.height * zoom);

    containerElement.style.width = `${scaledWidth}px`;
    containerElement.style.height = `${scaledHeight}px`;
  }

  onMount(() => {
    // Initial application of default size
    applyViewportSize(currentPreset.width, currentPreset.height);
  });
</script>

<div class="flex flex-col gap-10p">
  <div class="flex flex-wrap gap-10p m-10p">
    <div class="flex flex-wrap gap-10p mr-10p">
      {#each viewportPresets as preset}
        <TextButton
          role={isCurrentPreset(preset.width, preset.height)
            ? 'primary'
            : 'secondary'}
          size="sm"
          onclick={() => applyViewportSize(preset.width, preset.height)}
        >
          {preset.name}
        </TextButton>
      {/each}
    </div>

    <div class="flex items-center">
      <span class="mr-10p text-sm font-medium">Zoom:</span>
      <div class="flex gap-10p">
        {#each zoomOptions as option}
          <TextButton
            role={currentZoom === option.value ? 'primary' : 'secondary'}
            size="sm"
            onclick={() => applyZoom(option.value)}
          >
            {option.label}
          </TextButton>
        {/each}
      </div>
    </div>
  </div>

  <div
    bind:this={containerElement}
    style:width={currentPreset.width + 'px'}
    style:height={currentPreset.height + 'px'}
    class="m-10p box-content border-2 border-primary-500 resize overflow-hidden transition-all duration-200"
  >
    <!-- Viewport with all text scales -->
    <VirtualViewport
      bind:designWidth
      bind:designHeight
      bind:scaleViewport={viewportScaleViewport}
      bind:scaleW={viewportScaleW}
      bind:scaleH={viewportScaleH}
      bind:scaleUI={viewportScaleUI}
      bind:scaleTextBase={viewportScaleTextContent}
      bind:scaleTextHeading={viewportScaleTextHeading}
      bind:scaleTextUI={viewportScaleTextUI}
    >
      {@render children()}
    </VirtualViewport>
  </div>

  <!-- Scale info display -->
  <div class="bg-gray-100 p-10p text-base-md">
    <h3 class="font-bold mb-4ut">Viewport Scaling</h3>
    <div class="grid grid-cols-2 gap-2ut">
      <div>
        <p>
          <strong>Scale Viewport:</strong>
          {viewportScaleViewport.toFixed(4)}
        </p>
        <p><strong>Scale W:</strong> {viewportScaleW.toFixed(4)}</p>
        <p><strong>Scale H:</strong> {viewportScaleH.toFixed(4)}</p>
        <p><strong>Scale UI:</strong> {viewportScaleUI.toFixed(4)}</p>
      </div>
      <div>
        <p>
          <strong>Scale Text Content:</strong>
          {viewportScaleTextContent.toFixed(4)}
        </p>
        <p>
          <strong>Scale Text Heading:</strong>
          {viewportScaleTextHeading.toFixed(4)}
        </p>
        <p><strong>Scale Text UI:</strong> {viewportScaleTextUI.toFixed(4)}</p>
      </div>
    </div>

    <!-- Design dimensions info -->
    <div class="mt-10p border-t border-gray-300 pt-10p">
      <h3 class="font-bold mb-4ut">Dimensions</h3>
      <div class="grid grid-cols-2 gap-2ut">
        <div>
          <p>
            <strong>Container:</strong>
            {currentPreset.width} × {currentPreset.height}
          </p>
          <p>
            <strong>Zoomed:</strong>
            {Math.round(currentPreset.width * currentZoom)} × {Math.round(
              currentPreset.height * currentZoom
            )}
          </p>
        </div>
        <div>
          <p>
            <strong>Design:</strong>
            {designWidth} × {designHeight}
          </p>
          <p>
            <strong>Zoom:</strong>
            {currentZoom}x
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
