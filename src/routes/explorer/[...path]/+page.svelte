<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { TopBar, Explorer } from '../components.js';

  /** @type {{ data: { navigationData: Object, scalingEnabled: boolean, currentPath: string, FOLDER_NAME: string } }} */
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
    if (level === 0) {
      // Navigate back to folder root
      goto(`/explorer/${data.FOLDER_NAME}/`);
    } else if (explorerPath !== undefined && explorerPath !== '') {
      goto(`/explorer/${data.FOLDER_NAME}/${explorerPath}`);
    } else if (explorerNavigateToLevel) {
      explorerNavigateToLevel(level);
    }
  }

  // Current path from URL parameters - handle both root and subdirectory cases
  /** @type {string} */
  const currentPath = $derived($page.params.path || '');


</script>

<div data-page>
  <TopBar bind:scalingEnabled onchange={handleScalingChange}>
    {#snippet crumblePath()}
      <nav class="breadcrumb">
        <button
          class="breadcrumb-item type-ui-sm"
          onclick={() => handleBreadcrumbNavigation(0)}
        >
          {data.FOLDER_NAME}
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
    currentPath={data.currentPath}
    getActiveSegments={handleActiveSegments}
    rootName={data.FOLDER_NAME}
    folderName={data.FOLDER_NAME}
    getNavigateToLevelFunction={handleNavigateFunction}
  />
</div>

<style src="./style.css"></style>
