<script>
  import { goto } from '$app/navigation';

  /**
   * Reusable explorer component for navigating nested folder structures
   * @type {{
   *   navigationData: Object,
   *   currentPath: string,
   *   getActiveSegments?: (segments: string[]) => void,
   *   getNavigateToLevelFunction?: (fn: Function) => void,
   *   rootName?: string
   * }}
   */
  let {
    navigationData,
    currentPath = '',
    getActiveSegments,
    getNavigateToLevelFunction,
    rootName = 'Categories'
  } = $props();

  /** @type {string[]} */
  let pathSegments = $derived(
    currentPath ? currentPath.split('/').filter(Boolean) : []
  );

  /** @type {string[]} */
  let interactiveSegments = $state([]);

  /** @type {string[]} */
  let activeSegments = $derived(
    interactiveSegments.length > 0 ? interactiveSegments : pathSegments
  );

  // Notify parent of active segments changes - only when they actually change
  let lastActiveSegments = [];
  $effect(() => {
    if (
      getActiveSegments &&
      JSON.stringify(activeSegments) !== JSON.stringify(lastActiveSegments)
    ) {
      lastActiveSegments = [...activeSegments];
      getActiveSegments(activeSegments);
    }
  });

  /** @type {Object[]} */
  let breadcrumbColumns = $derived.by(() => {
    const columns = [];
    let current = navigationData;

    // Root column
    columns.push({
      title: rootName,
      items: Object.values(current).map((item) => ({
        name: item.name,
        displayName: item.displayName || item.name,
        isEndpoint: item.isEndpoint,
        isSelected: activeSegments.length > 0 && activeSegments[0] === item.name
      })),
      level: 0
    });

    // Build columns for each path segment
    for (let i = 0; i < activeSegments.length; i++) {
      const segment = activeSegments[i];

      if (current[segment]) {
        current = current[segment].children;

        if (Object.keys(current).length > 0) {
          const nextSegment = activeSegments[i + 1];

          columns.push({
            title: segment,
            items: Object.values(current).map((item) => ({
              name: item.name,
              displayName: item.displayName || item.name,
              isEndpoint: item.isEndpoint,
              isSelected: nextSegment === item.name
            })),
            level: i + 1
          });
        }
      }
    }

    return columns;
  });

  /**
   * Handle navigation to a folder or example
   * @param {number} level - Column level
   * @param {string} itemName - Item name
   * @param {boolean} isEndpoint - Whether this is a final example
   */
  function handleNavigation(level, itemName, isEndpoint) {
    // Build new path segments up to the selected level
    const newSegments = [...activeSegments.slice(0, level), itemName];
    const fullPath = newSegments.join('/');

    // Always navigate to explorer URL - let the route system handle state
    goto(`/explorer/${fullPath}`);
  }

  /**
   * Handle breadcrumb navigation
   * @param {number} level - Level to navigate back to
   */
  function navigateToLevel(level) {
    if (level === 0) {
      // Navigate back to root explorer
      goto('/explorer');
    } else {
      // Navigate to specific level
      const currentSegments =
        interactiveSegments.length > 0 ? interactiveSegments : pathSegments;
      const newSegments = currentSegments.slice(0, level);
      const explorerPath = newSegments.join('/');
      goto(`/explorer/${explorerPath}`);
    }
  }

  // Expose the navigate function to parent
  if (getNavigateToLevelFunction) {
    getNavigateToLevelFunction(navigateToLevel);
  }
</script>

<div class="explorer-container">
  <!-- Dynamic columns -->
  <div class="navigation-columns">
    {#each breadcrumbColumns as column, columnIndex}
      <div class="column" data-column={`level-${column.level}`}>
        <h2 class="type-heading-h2 mb-20up">{column.title}</h2>
        <nav class="folder-list">
          {#each column.items as item}
            <button
              class="folder-item"
              class:active={item.isSelected}
              class:endpoint={item.isEndpoint}
              onclick={() =>
                handleNavigation(column.level, item.name, item.isEndpoint)}
            >
              {item.displayName}
            </button>
          {/each}

          {#if column.items.length === 0}
            <div class="empty-state">
              <p class="type-base-sm">No items found</p>
            </div>
          {/if}
        </nav>
      </div>
    {/each}
  </div>
</div>

<style>
  .explorer-container {
    padding: 20px;
  }

  .navigation-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    align-items: start;
  }

  .column {
    min-height: 200px;
  }

  .folder-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .folder-item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--color-surface-700);
    transition: all 0.2s;
    font-size: 14px;
    line-height: 1.4;
  }

  .folder-item:hover {
    background-color: var(--color-surface-100);
  }

  .folder-item.active {
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
  }

  .folder-item.endpoint {
    border: 1px solid var(--color-surface-300);
    border-radius: 4px;
    margin: 2px 0;
  }

  .folder-item.endpoint:hover {
    border-color: var(--color-primary-500);
    background-color: var(--color-primary-50);
  }

  .empty-state {
    padding: 20px;
    text-align: center;
    color: var(--color-surface-500);
  }
</style>
