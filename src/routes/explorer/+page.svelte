<script>
  import { goto } from '$app/navigation';
  import TopBar from '../examples/TopBar.svelte';
  import Explorer from './Explorer.svelte';

  /** @type {{ data: { navigationData: Object, scalingEnabled: boolean } }} */
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
   * @param {string} [explorerPath] - Optional explorer path for URL updates
   */
  function handleBreadcrumbNavigation(level, explorerPath) {
    console.log('ROOT handleBreadcrumbNavigation called:', {
      level,
      explorerPath
    });

    // For root page breadcrumb navigation, only handle resetting to root locally
    // Do not navigate URLs - we're already on the root page

    if (level === 0) {
      console.log('ROOT: Level 0, resetting local state');
      // Reset to root - just clear the interactive state, no URL change needed
      if (explorerNavigateToLevel) {
        explorerNavigateToLevel(level);
      }
    } else {
      console.log('ROOT: Level > 0, navigating to catch-all route');
      // For deeper levels from breadcrumbs, navigate to catch-all route
      if (explorerPath !== undefined && explorerPath !== '') {
        goto(`/explorer/${explorerPath}`);
      } else if (explorerNavigateToLevel) {
        explorerNavigateToLevel(level);
      }
    }
  }
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

  <Explorer
    navigationData={data.navigationData}
    currentPath=""
    getActiveSegments={handleActiveSegments}
    rootName="examples"
    getNavigateToLevelFunction={handleNavigateFunction}
  />
</div>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .breadcrumb-item {
    background: transparent;
    border: none;
    color: var(--color-primary-500);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 14px;
  }

  .breadcrumb-item:hover {
    background-color: var(--color-surface-200);
  }

  .breadcrumb-separator {
    color: var(--color-surface-400);
    font-size: 14px;
  }
</style>
