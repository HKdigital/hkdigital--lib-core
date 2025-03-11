<script>
  import { DebugPanelDesignScaling } from '$lib/components/debug/index.js';

  import { onMount } from 'svelte';
  import { DESIGN, CLAMPING } from '$lib/design/design-config.js';
  import {
    enableScalingUI,
    getAllRootScalingVars
  } from '$lib/util/design-system/index.js';

  /**
   * @type {{ children: import('svelte').Snippet }}
   */
  let { children } = $props();

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
    //const cleanup = () => {};
    const cleanup = enableScalingUI(DESIGN, CLAMPING);

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
