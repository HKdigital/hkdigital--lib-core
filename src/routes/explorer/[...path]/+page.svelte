<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import TopBar from '../../examples/TopBar.svelte';
  import Explorer from '../Explorer.svelte';

  /** @type {{ data: { navigationData: Object, scalingEnabled: boolean, examplePath: string, isValidExample: boolean } }} */
  let { data } = $props();

  /** @type {boolean} */
  let scalingEnabled = $state(data.scalingEnabled);

  /** @type {string[]} */
  let activeSegments = $state([]);

  /** @type {(level: number) => void} */
  let explorerNavigateToLevel;

  /**
   * Receive active segments from Explorer
   * @param {string[]} segments
   */
  function handleActiveSegments(segments) {
    activeSegments = [...segments];
  }

  /**
   * Receive navigate function from Explorer
   * @param {(level: number) => void} fn
   */
  function handleNavigateFunction(fn) {
    explorerNavigateToLevel = fn;
  }

  /**
   * Handle scaling change from TopBar
   * @param {boolean} enabled
   */
  function handleScalingChange(enabled) {
    scalingEnabled = enabled;
  }

  /**
   * Handle breadcrumb navigation
   * @param {number} level - Level to navigate back to
   */
  function handleBreadcrumbNavigation(level) {
    if (explorerNavigateToLevel) {
      explorerNavigateToLevel(level);
    }
  }

  // Current path from URL parameters
  /** @type {string} */
  const currentPath = $derived($page.params.path || '');

  // If this is a valid example, redirect to the actual example
  $effect(() => {
    if (data.isValidExample && data.examplePath) {
      // Redirect to the actual example
      window.location.href = `/examples/${data.examplePath}`;
    }
  });
</script>

<div data-page>
  <TopBar bind:scalingEnabled onchange={handleScalingChange}>
    {#snippet crumblePath()}
      <nav class="breadcrumb">
        <button
          class="breadcrumb-item type-ui-sm"
          onclick={() => handleBreadcrumbNavigation(0)}
        >
          examples
        </button>
        {#if activeSegments.length > 0}
          {#each activeSegments as segment, index}
            <span class="breadcrumb-separator">/</span>
            <button
              class="breadcrumb-item type-ui-sm"
              onclick={() => handleBreadcrumbNavigation(index + 1)}
            >
              {segment}
            </button>
          {/each}
        {/if}
      </nav>
    {/snippet}
  </TopBar>

  {#if data.isValidExample}
    <div class="loading-example">
      <p class="type-base-md">Redirecting to example...</p>
    </div>
  {:else}
    <Explorer
      navigationData={data.navigationData}
      {currentPath}
      getActiveSegments={handleActiveSegments}
      rootName="examples"
      getNavigateToLevelFunction={handleNavigateFunction}
    />
  {/if}
</div>

<style src="./style.css"></style>
