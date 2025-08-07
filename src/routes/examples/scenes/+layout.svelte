<script>
  import { DebugPanelDesignScaling } from '$lib/ui/primitives/debug/index.js';

  import { onMount } from 'svelte';
  import {
    designTokens,
    enableScalingUI,
    getAllRootScalingVars
  } from '$lib/design/index.js';

  /**
   * @type {{ children: import('svelte').Snippet,
   *          data: { scalingEnabled: boolean} }}
   */
  let { children, data } = $props();

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

  onMount(() => {
    // Initialize the design scaling system
    console.log({ scalingEnabled: data.scalingEnabled });

    let cleanup;

    if (data?.scalingEnabled) {
      cleanup = enableScalingUI(designTokens.DESIGN, designTokens.CLAMPING);
    } else {
      cleanup = () => {};
    }

    // Return combined cleanup function
    return () => {
      cleanup();
    };
  });
</script>

<div class="w-full h-full overflow-clip">
  {@render children()}
</div>

<DebugPanelDesignScaling />
