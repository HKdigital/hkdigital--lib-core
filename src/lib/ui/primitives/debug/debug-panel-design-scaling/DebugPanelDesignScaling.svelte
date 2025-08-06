<script>
  import { onMount } from 'svelte';
  import {
    designTokens,
    enableScalingUI,
    getAllRootScalingVars
  } from '$lib/design/index.js';

  /**
   * Holds the current scaling values for the debug panel
   * @type {Object}
   */
  let scalingValues = $state({
    scaleW: 0,
    scaleH: 0,
    scaleViewport: 0,
    scaleUI: 0,
    scaleTextBase: 0,
    scaleTextHeading: 0,
    scaleTextUI: 0
  });

  /**
   * Controls visibility of the debug panel
   */
  let showDebugPanel = $state(false);

  /**
   * Updates scaling values for the debug panel
   */
  function updateDebugValues() {
    // Get scaling values
    scalingValues = getAllRootScalingVars();

    // Update window size display if in browser context
    if (typeof window !== 'undefined') {
      const windowSizeElement = document.getElementById('window-size');
      if (windowSizeElement) {
        windowSizeElement.textContent = `${window.innerWidth}×${window.innerHeight}px`;
      }
    }
  }

  onMount(() => {
    // Initialize the design scaling system
    //const cleanup = () => {};
    const cleanup = enableScalingUI(designTokens.DESIGN, designTokens.CLAMPING);

    // Update debug values initially
    updateDebugValues();

    // Set up event listener for updating debug values on resize
    window.addEventListener('resize', updateDebugValues);

    // Return combined cleanup function
    return () => {
      cleanup();
      window.removeEventListener('resize', updateDebugValues);
    };
  });

  /**
   * Toggle debug panel visibility
   */
  function toggleDebugPanel() {
    showDebugPanel = !showDebugPanel;
  }

  /**
   * Format a number to 2 decimal places
   * @param {number} value - The number to format
   * @returns {string} Formatted number
   */
  function formatNumber(value) {
    return value.toFixed(2);
  }
</script>

<!-- Debug Panel -->
{#if showDebugPanel}
  <div
    class="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-2 text-ui-md z-50 font-mono"
  >
    <div class="flex justify-between items-center mb-1">
      <h3 class="font-bold">Design System Scaling</h3>
      <button
        onclick={toggleDebugPanel}
        class="ml-2 px-1.5 bg-gray-700 hover:bg-gray-600 rounded"
      >
        &times;
      </button>
    </div>
    <div class="grid grid-cols-2 gap-x-2 gap-y-0.5">
      <div class="text-gray-400">Design Width:</div>
      <div>{designTokens.DESIGN.width}px</div>

      <div class="text-gray-400">Design Height:</div>
      <div>{designTokens.DESIGN.height}px</div>

      <div class="text-gray-400">Window:</div>
      <div id="window-size">...</div>

      <div class="text-gray-400">Scale W:</div>
      <div>{formatNumber(scalingValues.scaleW)}</div>

      <div class="text-gray-400">Scale H:</div>
      <div>{formatNumber(scalingValues.scaleH)}</div>

      <div class="text-gray-400">Viewport:</div>
      <div>{formatNumber(scalingValues.scaleViewport)}</div>

      <div class="text-gray-400">UI:</div>
      <div>{formatNumber(scalingValues.scaleUI)}</div>

      <div class="text-gray-400">Text Content:</div>
      <div>{formatNumber(scalingValues.scaleTextBase)}</div>

      <div class="text-gray-400">Text Heading:</div>
      <div>{formatNumber(scalingValues.scaleTextHeading)}</div>

      <div class="text-gray-400">Text UI:</div>
      <div>{formatNumber(scalingValues.scaleTextUI)}</div>
    </div>

    <div class="mt-1 pt-1 border-t border-gray-600 text-gray-400">
      <div>Clamping:</div>
      <div class="grid grid-cols-3 text-2xs">
        <div>UI: {designTokens.CLAMPING.ui.min} - {designTokens.CLAMPING.ui.max}</div>
        <div>
          Content: {designTokens.CLAMPING.textBase.min} - {designTokens.CLAMPING.textBase.max}
        </div>
        <div>
          Heading: {designTokens.CLAMPING.textHeading.min} - {designTokens.CLAMPING.textHeading.max}
        </div>
      </div>
    </div>
  </div>
{:else}
  <!-- Debug Panel Toggle Button -->
  <button
    onclick={toggleDebugPanel}
    class="fixed bottom-0 right-0 bg-black bg-opacity-75 text-white p-16ut py-8ut text-ui-md z-50 font-mono hover:bg-opacity-90"
  >
    Show Debug
  </button>
{/if}
